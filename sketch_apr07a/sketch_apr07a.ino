#include <WiFi.h>
#include <HTTPClient.h>

const char* wifiSsid = "Kenaje_2.4G";
const char* wifiPass = "kenaje@1819";

const char* servers = "http://192.168.101.50:9999";
const char* auth = "eyJlbWFpbCI6ImFiaGlzaGVrLmtzQGZyaW5rcy5haSIsInBob25lX251bWJlciI6Ijk0ODI2MzYxOTEiLCJpYXQiOjE3MTA4MzI4MTksImV4cCI6MTcxMTI2NDgxOSwiYXVkIjoiMjc1IiwiaXNzIjoiRnJpbmtzIn0";

const int inputPin = 21 ;
bool previousState = false;
const int sleepDelay = 3000;

const String startApi = "/start";
const String pingApi = "/ping";
const String stopApi = "/stop";

const int indicator = 2;

HTTPClient http;

void getRequest(String url){
  http.begin(servers+url);
  http.addHeader("Authorization", auth);

  int httpCode = http.GET(); // Make the GET request
  if (httpCode > 0) {
    Serial.print(servers); // Print the response payload
    Serial.print(url);
    Serial.print(" Success");
    Serial.println();
  } else {
    Serial.print(servers); // Print the response payload
    Serial.print(url);
    Serial.print(" Failed");
    Serial.println();
  }
  http.end();
}

void connectToWifi(){
  if(WiFi.status() == WL_CONNECTED){
    Serial.println("Wifi connection available");
    return;
  }
  
  Serial.println("Connectin to wifi");

  digitalWrite(indicator, LOW);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Retrying...");
  }

  digitalWrite(indicator, HIGH);
  Serial.println("Wifi connected");
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(inputPin, INPUT);
  pinMode(indicator, OUTPUT);

  WiFi.begin(wifiSsid, wifiPass);
  connectToWifi();
}

void loop() {
  // put your main code here, to run repeatedly:
  connectToWifi();

  int readValue = digitalRead(inputPin);
  float analogValue = analogRead(inputPin);
  Serial.print("Read value ");
  Serial.println(readValue);
  bool currentState = readValue== HIGH;
  Serial.print(analogValue);
  Serial.println(currentState);
  

  if(currentState){
    //if prev also high, just ping
    if(previousState){
//      do ping
      getRequest(pingApi);
    }
    else{
      getRequest(startApi);
    }
    previousState = true;
    //if prev is low, send start
  }
  else{
    //if prev was high, just send stop
    if(previousState){
//      hit stop api
      getRequest(stopApi);
    }
    previousState = false;
  }

  delay(sleepDelay);

}
