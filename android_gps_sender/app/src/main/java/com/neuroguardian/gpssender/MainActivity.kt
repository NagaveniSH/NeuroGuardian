package com.neuroguardian.gpssender

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity(), LocationListener {

    private lateinit var etPatientId: EditText
    private lateinit var etBackendUrl: EditText
    private lateinit var tvStatus: TextView
    private lateinit var tvLatitude: TextView
    private lateinit var tvLongitude: TextView
    private lateinit var tvLastUpdate: TextView
    private lateinit var tvSafeZone: TextView
    private lateinit var btnStart: Button
    private lateinit var btnStop: Button

    private var locationManager: LocationManager? = null
    private var isTracking = false
    private var lastLocation: Location? = null

    private val handler = Handler(Looper.getMainLooper())
    private val sendIntervalMs = 20000L // 20 seconds interval

    private val periodicSender = object : Runnable {
        override fun run() {
            if (isTracking && lastLocation != null) {
                sendLocationToBackend(lastLocation!!)
            }
            if (isTracking) {
                handler.postDelayed(this, sendIntervalMs)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etPatientId = findViewById(R.id.etPatientId)
        etBackendUrl = findViewById(R.id.etBackendUrl)
        tvStatus = findViewById(R.id.tvStatus)
        tvLatitude = findViewById(R.id.tvLatitude)
        tvLongitude = findViewById(R.id.tvLongitude)
        tvLastUpdate = findViewById(R.id.tvLastUpdate)
        tvSafeZone = findViewById(R.id.tvSafeZone)
        btnStart = findViewById(R.id.btnStart)
        btnStop = findViewById(R.id.btnStop)

        // Default configurations
        etPatientId.setText("pat_alz_1790140707101")
        etBackendUrl.setText("http://192.168.1.11:5000/update_location")

        btnStart.setOnClickListener { startGpsTracking() }
        btnStop.setOnClickListener { stopGpsTracking() }
    }

    private fun checkLocationPermission(): Boolean {
        return (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)
    }

    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
            1001
        )
    }

    private fun startGpsTracking() {
        val patientId = etPatientId.text.toString().trim()
        val backendUrl = etBackendUrl.text.toString().trim()

        if (patientId.isEmpty()) {
            Toast.makeText(this, "Please enter a valid Patient ID", Toast.LENGTH_SHORT).show()
            return
        }

        if (backendUrl.isEmpty()) {
            Toast.makeText(this, "Please enter the Flask backend URL", Toast.LENGTH_SHORT).show()
            return
        }

        if (!checkLocationPermission()) {
            requestLocationPermission()
            return
        }

        try {
            locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
            val isGpsEnabled = locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) ?: false
            val isNetEnabled = locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ?: false

            if (!isGpsEnabled && !isNetEnabled) {
                tvStatus.text = "Status: GPS Disabled on Device"
                Toast.makeText(this, "Please enable GPS/Location in device settings", Toast.LENGTH_LONG).show()
                return
            }

            if (isGpsEnabled) {
                locationManager?.requestLocationUpdates(LocationManager.GPS_PROVIDER, 5000L, 2.0f, this)
            }
            if (isNetEnabled) {
                locationManager?.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 5000L, 2.0f, this)
            }

            isTracking = true
            btnStart.isEnabled = false
            btnStop.isEnabled = true
            tvStatus.text = "Status: 🟢 Tracking Active (Reporting every 20s)"
            handler.post(periodicSender)

        } catch (e: SecurityException) {
            tvStatus.text = "Status: ❌ Permission Error: ${e.message}"
        } catch (e: Exception) {
            tvStatus.text = "Status: ❌ Error: ${e.message}"
        }
    }

    private fun stopGpsTracking() {
        isTracking = false
        handler.removeCallbacks(periodicSender)
        locationManager?.removeUpdates(this)

        btnStart.isEnabled = true
        btnStop.isEnabled = false
        tvStatus.text = "Status: ⚪ Stopped"
    }

    override fun onLocationChanged(location: Location) {
        lastLocation = location
        runOnUiThread {
            tvLatitude.text = "Latitude: ${String.format(Locale.US, "%.5f", location.latitude)}"
            tvLongitude.text = "Longitude: ${String.format(Locale.US, "%.5f", location.longitude)}"
        }
    }

    private fun sendLocationToBackend(location: Location) {
        val patientId = etPatientId.text.toString().trim()
        val backendUrl = etBackendUrl.text.toString().trim()

        thread {
            var conn: HttpURLConnection? = null
            try {
                val url = URL(backendUrl)
                conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; utf-8")
                conn.setRequestProperty("Accept", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 8000
                conn.readTimeout = 8000

                val jsonPayload = JSONObject().apply {
                    put("patientId", patientId)
                    put("latitude", location.latitude)
                    put("longitude", location.longitude)
                }

                OutputStreamWriter(conn.outputStream).use { writer ->
                    writer.write(jsonPayload.toString())
                    writer.flush()
                }

                val responseCode = conn.responseCode
                if (responseCode in 200..299) {
                    val responseStr = conn.inputStream.bufferedReader().use { it.readText() }
                    val jsonResp = JSONObject(responseStr)
                    val locObj = jsonResp.optJSONObject("location")
                    val inSafeZone = locObj?.optBoolean("isInSafeZone", true) ?: true
                    val distance = locObj?.optDouble("distanceFromSafeZoneCenter", 0.0) ?: 0.0

                    val timeStr = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
                    runOnUiThread {
                        tvLastUpdate.text = "Last Sent: $timeStr (HTTP $responseCode)"
                        tvSafeZone.text = if (inSafeZone) "Geofence: 🟢 Inside Safe Zone (${distance.toInt()}m from home)"
                                          else "Geofence: 🔴 Outside Safe Zone (${distance.toInt()}m - WANDERING!)"
                    }
                } else {
                    runOnUiThread {
                        tvLastUpdate.text = "Last Sent: Error HTTP $responseCode"
                    }
                }

            } catch (e: Exception) {
                runOnUiThread {
                    tvLastUpdate.text = "Last Sent: Connection Failed (${e.localizedMessage ?: "Timeout"})"
                }
            } finally {
                conn?.disconnect()
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1001 && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startGpsTracking()
        } else {
            Toast.makeText(this, "Location permission required to track patient", Toast.LENGTH_LONG).show()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopGpsTracking()
    }
}
