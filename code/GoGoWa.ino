#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

//special char
byte leftArrow[8]  = { 
  B00010, 
  B00110, 
  B01110, 
  B11110, 
  B01110, 
  B00110, 
  B00010, 
  B00000 
};

byte rightArrow[8] = { 
  B01000, 
  B01100, 
  B01110, 
  B01111, 
  B01110, 
  B01100, 
  B01000, 
  B00000 
};

byte gogowaTL[8] = { 
  B00001, 
  B00011, 
  B00111, 
  B00101, 
  B00011, 
  B00001, 
  B00001, 
  B00001 
};

byte gogowaTR[8] = { 
  B10000, 
  B11000, 
  B11110, 
  B11110, 
  B11010, 
  B10011,
  B11000, 
  B11000 
};

byte gogowaBL[8] = { 
  B00011, 
  B00011, 
  B00111, 
  B01111,
  B01111, 
  B00001, 
  B00001, 
  B00011 
};

byte gogowaBR[8] = { 
  B11000, 
  B11000, 
  B11100,
  B11110, 
  B11110, 
  B10000, 
  B10000, 
  B10000 
};

byte gogowaTL_flip[8] = { 
  B10000, 
  B11000, 
  B11100, 
  B10100, 
  B11000, 
  B10000, 
  B10000, 
  B10000 
};

byte gogowaTR_flip[8] = { 
  B00001, 
  B00011, 
  B01111, 
  B01111,
  B01011, 
  B11001, 
  B00011, 
  B00011 
};

byte person1[8] = { 
  B01110, 
  B01110, 
  B00100, 
  B01110, 
  B11111, 
  B01110, 
  B01010, 
  B01010 
};

byte person2[8] = { 
  B01110, 
  B01110, 
  B00100, 
  B01110, 
  B11111, 
  B01110, 
  B11010, 
  B10010 
};

//set ตัวแปร + pin
int noteDuration[] = { 200, 200, 400, 400, 400, 200, 200, 200, 200, 200 };
float speedArr[] = {
  0.25, 0.5, 0.75, 1.0, 1.25, 1.5,
  0.25, 0.25, 0.25, 0.25, 0.25,
  0.5,  0.5,  0.5,  0.5,
  0.75, 0.75, 0.75, 1.0,  1.0, 0.10
};

const int buttonPin = 2; 
const int led_red = 5;
const int led_green = 6;
const int led_blue = 7;
const int buzzer = 12; 
const int poten = A3;
const int NOTE_B5 = 987, NOTE_E5 = 659, NOTE_D5 = 587;
int melody[] = { NOTE_B5, NOTE_E5, NOTE_E5, NOTE_E5, NOTE_D5, NOTE_E5, NOTE_E5, NOTE_B5, NOTE_B5, NOTE_D5 };

int currentLevel = -1;
String levelName = "";
bool isConfirmed = false;
bool isFirstPlay = true;
int targetDistance = 0;
int currentDistance = 0;
bool isGameOver = false, isGameWon = false;

int lastButtonState = HIGH;
int lastPlayerCol = 0;         
bool lastGogowaState = false;  

unsigned long gameStartTime = 0;
const int BASE_SPEED_FACTOR = 100;
int lastPrintedTime = -1; 


void setRGBColor(int r, int g, int b) {
  analogWrite(led_red, 255 - r);
  analogWrite(led_green, 255 - g);
  analogWrite(led_blue, 255 - b);
}

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(led_red, OUTPUT);
  pinMode(led_green, OUTPUT);
  pinMode(led_blue, OUTPUT);
  pinMode(buzzer, OUTPUT);
  
  setRGBColor(0, 0, 0);
  randomSeed(analogRead(0));
  
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  lcd.createChar(0, leftArrow);
  lcd.createChar(1, rightArrow);
  
  lcd.setCursor(5, 0); lcd.print("GOGOWA");
  delay(1000);
  lcd.clear();
  lcd.setCursor(0, 0); lcd.print("Pls Select Level");
}

void loop() {
  if (!isConfirmed) {
    int plotLevel = analogRead(poten);
    int level = 0;
    
    if (plotLevel < 341) {
      level = 3;
      levelName = "  Hard  "; 
    } else if (plotLevel < 682) { 
      level = 2; 
      levelName = " Medium ";
    } else { 
      level = 1; 
      levelName = "  Easy  "; 
    }

    if (level != currentLevel) {
      currentLevel = level;
      lcd.setCursor(0, 1); lcd.write(byte(0)); 
      lcd.setCursor(4, 1); lcd.print(levelName);
      lcd.setCursor(15, 1); lcd.write(byte(1)); 
    }

    if (digitalRead(buttonPin) == LOW) {
      delay(50);
      if (digitalRead(buttonPin) == LOW) {
        isConfirmed = true;
        tone(buzzer, 1200, 100);
        lcd.clear();
        gameStartTime = millis(); 
        lastPrintedTime = -1;
        while(digitalRead(buttonPin) == LOW) { delay(10); }
      }
    }
  } else {
    if (currentLevel == 1) 
      targetDistance = 60;
    else if (currentLevel == 2) 
      targetDistance = 90;
    else 
      targetDistance = 150;
    
    gamePlay(currentLevel);
  }
}

// update time
void updateTimeDisplay() {
  int elapsed = (millis() - gameStartTime) / 1000;
  if (elapsed != lastPrintedTime) {
    lcd.setCursor(0, 0);
    lcd.print("Time:");
  
    if (elapsed < 10) {
      lcd.print("0"); 
    }

    lcd.print(elapsed);
    lcd.print("s  ");
    lastPrintedTime = elapsed;
  }
}

// update แสดงผล gameplay
void updateGameDisplay(bool isMusicOn) {
  if (lastGogowaState != isMusicOn) {
    if (isMusicOn) {
      lcd.createChar(2, gogowaTR_flip); 
      lcd.createChar(3, gogowaTL_flip);
    } else {
      lcd.createChar(2, gogowaTL);
      lcd.createChar(3, gogowaTR);
    }
    lastGogowaState = isMusicOn;
  }

  lcd.setCursor(14, 0); lcd.write(byte(2)); lcd.write(byte(3));
  lcd.setCursor(14, 1); lcd.write(byte(4)); lcd.write(byte(5));

  int playerCol = (currentDistance * 13) / targetDistance;
  if (playerCol > 13) {
    playerCol = 13;
  }

  if (lastPlayerCol != playerCol) {
    lcd.setCursor(lastPlayerCol, 1);
    lcd.print(" ");
    lastPlayerCol = playerCol;
  }

  lcd.setCursor(playerCol, 1);
  if (currentDistance % 2 == 0) {
    lcd.write(byte(0)); 
  } else {
    lcd.write(byte(1)); 
  }
}

// gameplay หลัก
void gamePlay(int level) {
  if (isGameWon || isGameOver) { 
    if (isGameWon) {
      playWinSound(); 
    } else if (isGameOver) {
      playLoseSound(); 
    }

    delay(2000);
    
    while (digitalRead(buttonPin) == LOW) { 
      delay(50);
    }
    
    while (digitalRead(buttonPin) == HIGH) {
      delay(50); 
    }
    
    isConfirmed = false;
    isFirstPlay = true;
    currentDistance = 0;
    isGameOver = false;
    isGameWon = false;
    currentLevel = -1;
    lastPrintedTime = -1;

    setRGBColor(0, 0, 0);
    lcd.createChar(0, leftArrow);
    lcd.createChar(1, rightArrow);

    lcd.clear();
    lcd.setCursor(0, 0); 
    lcd.print("Pls Select Level");
    delay(300); 
    return; 
  }
  
  float speedNote;
  if (isFirstPlay || level == 1) {
    speedNote = 1.0;
  } else {
    if (level == 3) {
      speedNote = speedArr[random(0, 22)];
    } else {
      speedNote = speedArr[random(0, 6)];
    }
  }


  if (isFirstPlay) {
    lcd.createChar(0, person1);
    lcd.createChar(1, person2);
    lcd.createChar(4, gogowaBL);
    lcd.createChar(5, gogowaBR);
    lastPlayerCol = 0;
    lastGogowaState = false; 
    updateTimeDisplay();
  }
  
  
  setRGBColor(0, 255, 0); // ไฟเขียว
  updateGameDisplay(true); 

  // เริ่มเล่น
  for (int i = 0; i < 10; i++) {
    if (level == 1 && i == 7) {
      setRGBColor(255, 105, 0); 
    }

    tone(buzzer, melody[i], (int)(noteDuration[i] * speedNote));
    
    int pause1 = (int)(noteDuration[i] * speedNote * 1.30);
    waitAndCheckButton(pause1, true, targetDistance);
    
    noTone(buzzer); 
    
    int pause2 = (int)(noteDuration[i] * speedNote * 0.30);
    waitAndCheckButton(pause2, true, targetDistance);
    
    if (isGameOver || isGameWon) {
      return;
    }
  }

  // เพลงหยุด
  setRGBColor(255, 0, 0);
  isFirstPlay = false;
  
  updateGameDisplay(false); 

  long redWaitTime = random(2000, 6000);
  waitAndCheckButton(redWaitTime, false, targetDistance);
}

// เช็คการกดปุ่ม + นับระยะทาง + เช็คแพ้ชนะ
void waitAndCheckButton(unsigned long waitTime, bool isSafeToPress, int targetDist) {
  unsigned long startTime = millis();

  while (millis() - startTime < waitTime) {
    if (isGameOver || isGameWon) {
      return;
    }

    updateTimeDisplay();

    int buttonState = digitalRead(buttonPin);
    
    if (buttonState == LOW && lastButtonState == HIGH) {
      delay(20); 
      
      if (digitalRead(buttonPin) == LOW) {
        if (isSafeToPress) {
          currentDistance++;
          updateGameDisplay(true); 

          if (currentDistance >= targetDist) {
            isGameWon = true;
          }
        } else {
          isGameOver = true;
        }
      }
    }
    lastButtonState = buttonState;
  }
}

// เสียงตอนชนะ + รวมคะแนน
void playWinSound() {
  delay(1000); 
  setRGBColor(0, 0, 255); // ไฟสีน้ำเงิน
  
  float timeUsed = (millis() - gameStartTime) / 1000.0;
  int difficultyMultiplier = currentLevel; 
  
  long finalScore = (targetDistance / timeUsed) * BASE_SPEED_FACTOR * difficultyMultiplier;
  
  lcd.clear(); 
  lcd.setCursor(4, 0); 
  lcd.print("YOU WON!");
  
  String scoreText = String(finalScore) + " point";
  int centerPos = (16 - scoreText.length()) / 2;
  
  lcd.setCursor(centerPos, 1); 
  lcd.print(scoreText);
  
  tone(buzzer, 523, 200); delay(200); tone(buzzer, 659, 200); delay(200);
  tone(buzzer, 784, 200); delay(200); tone(buzzer, 1047, 600); delay(600);
}

// เสียงตอนแพ้
void playLoseSound() {
  setRGBColor(255, 0, 0); // ไฟสีแดง
  
  lcd.clear(); 
  lcd.setCursor(3, 0); 
  lcd.print("GAME OVER!");
  
  tone(buzzer, 300, 300); delay(300); tone(buzzer, 250, 300); delay(300);
  tone(buzzer, 150, 800); delay(800);
}