#include <Servo.h>

Servo leftservo;  
Servo rightservo;

const int rightTriggerPin = 5;
const int rightEchoPin = 6;
const int frontTriggerPin = 2;
const int frontEchoPin = 3;

const int leftServoPin = 9;
const int rightServoPin = 10;

const int heatSensorPin = A0;

int angle = 0;

enum DRIVE {
    FORWARD, BACKWARD, NONE
};

void setup() {
    Serial.begin(9600);

    leftservo.attach(leftServoPin);  
    rightservo.attach(rightServoPin); 

    pinMode(heatSensorPin, INPUT);
    pinMode(rightTriggerPin, OUTPUT);
    pinMode(rightEchoPin, INPUT);
    pinMode(frontTriggerPin, OUTPUT);
    pinMode(frontEchoPin, INPUT);
}

long distance(int triggerPin, int echoPin) {
    digitalWrite(triggerPin, LOW);
    delayMicroseconds(2);

    digitalWrite(triggerPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(triggerPin, LOW);

    long duration = pulseIn(echoPin, HIGH);

    return duration * 0.034 / 2.0;
}

double getTemperature(long heatSensorInput) {
    double temp = (double) heatSensorInput / 1024;

    temp *= 5;
    temp -= 0.5;
    temp *= 100;

    return temp;
}

long readSensors() {
    long temp = getTemperature(analogRead(heatSensorPin));

    long frontDistance = distance(frontTriggerPin, frontEchoPin);

    long rightDistance = distance(rightTriggerPin, rightEchoPin);

    Serial.print(rightDistance);
    Serial.print(",");
    Serial.print(frontDistance);
    Serial.print(",");
    Serial.print(angle);
    Serial.print(",");
    Serial.print(temp);
    Serial.println();

    return frontDistance;
}

void drive(DRIVE direction) {
    switch(direction) {
        case FORWARD:
            leftservo.write(0);
            rightservo.write(179);
            break;
        case BACKWARD:
            leftservo.write(179);
            rightservo.write(0);
            break;
        case NONE:
            leftservo.write(90);
            rightservo.write(90);
            break;
    }
}

//const long angleDelays[][2]{{135, 1012.5}, {90, 720}};

void turn() {
    leftservo.write(179);
    rightservo.write(179);

    //auto angleDelay = angleDelays[random(sizeof(angleDelays))];

    angle += 135;

    angle = angle % 360;

    delay(1012.5);

    drive(NONE);
}

void loop() {
    drive(FORWARD);

    while(readSensors() > 15) {
        delay(500);
    }

    drive(NONE);

    delay(1000);

    turn();

    Serial.println();

    delay(1000);
}