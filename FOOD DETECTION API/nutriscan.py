from flask import Flask, render_template, request, Response, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from ultralytics import YOLO
import cv2
from PIL import Image
import numpy as np
from io import BytesIO
import psycopg2
from dotenv import load_dotenv
import  os
import base64


app = Flask(__name__)
CORS(app)

load_dotenv()

db_name = os.getenv('PG_DATABASE')
db_user = os.getenv('PG_USER')
db_password = os.getenv('PG_PASSWORD')
db_host = os.getenv('PG_HOST')
db_port = os.getenv('PG_PORT')

try:
     connection = psycopg2.connect(database=db_name,user=db_user,password=db_password,host=db_host,port=db_port)
     print("successfully database connected")
except:
    print("database connnection failed to connected")
    
    
query=connection.cursor()


try:
    query.execute("select * from sample")
    rows = query.fetchone()
    connection.commit()
    print("query successfull",rows)
except:
    
    print("query fail")

model = YOLO(r"C:\Users\bharg\OneDrive\Desktop\NutriationApplication\FOOD DETECTION API\best (4).pt") 

fixed_nutritional_values = {
   "apple": {"Calories": 95, "Carbohydrates": 25, "Fats": 0.3, "Proteins": 0.5, "Vitamins": "Vitamin C, Vitamin K"},
    "banana": {"Calories": 105, "Carbohydrates": 27, "Fats": 0.3, "Proteins": 1.3, "Vitamins": "Vitamin B6, Vitamin C, Potassium"},
    "lemon": {"Calories": 17, "Carbohydrates": 5.4, "Fats": 0.2, "Proteins": 0.6, "Vitamins": "Vitamin C"},
    "pear": {"Calories": 101, "Carbohydrates": 27, "Fats": 0.2, "Proteins": 0.6, "Vitamins": "Vitamin C, Vitamin K"},
    "strawberry": {"Calories": 49, "Carbohydrates": 12, "Fats": 0.5, "Proteins": 1, "Vitamins": "Vitamin C, Folate"},
    "Ajwa": {"Calories": 20,"Carbohydrates": 5,"Fats": 0,"Proteins": 0.2,"Vitamins": "Vitamin B6, Potassium"},
    "Khidri": {"Calories": 66,"Carbohydrates": 18,"Fats": 0,"Proteins": 0.5,"Vitamins": "Vitamin B6, Potassium"},
    "Saqai": {"Calories": 28,"Carbohydrates": 7,"Fats": 0,"Proteins": 0.2,"Vitamins": "Vitamin B6, Potassium"},
    "Sukkari": {"Calories": 45,"Carbohydrates": 12,"Fats": 0,"Proteins": 0.3,"Vitamins": "Vitamin B6, Potassium"},

}

total_calories = 0
total_protein=0
cap = None
nutritional_info = None
latest_frame = None  # To store the latest frame
socketio = SocketIO(app)

def generate_frames():
    global cap, latest_frame
    if not cap or not cap.isOpened():
        cap = cv2.VideoCapture(0) 

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        latest_frame = frame.copy()  # Store the latest frame

        results = model(frame)

        annotated_frame = frame.copy()

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy() 
                class_id = int(box.cls[0])
                class_name = result.names[class_id] 

                if class_name in fixed_nutritional_values:
                    nutritional_info = fixed_nutritional_values[class_name]
                   
                    socketio.emit('detected_food', nutritional_info)

                    y_offset = int(y1)
                    line_spacing = 30
                    nutritional_names = ["Calories", "Carbohydrates", "Fats", "Proteins", "Vitamins"]
                    nutritional_values = [
                        f"{nutritional_info['Calories']} kcal",
                        f"{nutritional_info['Carbohydrates']}g",
                        f"{nutritional_info['Fats']}g",
                        f"{nutritional_info['Proteins']}g",
                        f"{nutritional_info['Vitamins']}"
                    ]

                    for i, (name, value) in enumerate(zip(nutritional_names, nutritional_values)):
                        y_position = y_offset + (i * line_spacing)
                        cv2.putText(annotated_frame, f"{name}: ", (int(x1), y_position), cv2.FONT_HERSHEY_SIMPLEX,
                                    0.5, (0, 0, 255), 2)
                        cv2.putText(annotated_frame, f"{value}", (int(x1) + 100, y_position), cv2.FONT_HERSHEY_SIMPLEX,
                                    0.5, (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()
    cap = None

@app.route('/API')
def index():
    return render_template('scan.html')

@app.route('/detect', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']
   
    if file.filename == '':
        return "No selected file", 400
   
    try:
        image = Image.open(file.stream).convert('RGB') 
      
        return "Image processed successfully", 200
    except Exception as e:
        return f"Error processing image: {str(e)}", 500

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stop_feed', methods=['POST'])
def stop_feed():
    global cap
    if cap and cap.isOpened():
        cap.release()
        cap = None
    return jsonify({"message": "Webcam feed stopped"}), 200

@app.route('/start_feed', methods=['POST'])
def start_feed():
    global cap
    if not cap or not cap.isOpened():
        cap = cv2.VideoCapture(0)  
    return jsonify({"message": nutritional_info}), 200

@app.route('/eat', methods=['POST'])
def eat():
    global cap
    if cap and cap.isOpened():
        cap.release()
        cap = None
    global total_calories
    global total_protein
    calorie_count = request.json.get('calories', 0)
    print(nutritional_info)
    print(total_calories,total_protein)
    if latest_frame is not None:
        # Save or process the captured image
        img = Image.fromarray(cv2.cvtColor(latest_frame, cv2.COLOR_BGR2RGB))
         # Convert the image to binary data without storing it
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='JPEG')  # Save the image in-memory in JPEG format
        img_byte_arr = img_byte_arr.getvalue()  # Get the binary data
        
        # Print the binary data in the console
        query.execute("insert into sample(image,description) values (%s,%s)",(img_byte_arr, "scaned image"))
        connection.commit()
        print()

        #img.save('captured_frame.jpg')  # Saving the captured frame as an image file
        
        # You can process this image further as per your requirements
    return jsonify({"total_calories": total_calories}), 200

@app.route("/image")
def get_image():
    query.execute("SELECT image FROM sample")
    image_data = query.fetchall()
        
    if image_data:
        encoded_images = [base64.b64encode(image[0]).decode('utf-8') for image in image_data]
        return render_template("image.html", images=encoded_images)
    return "Image not found", 404


if __name__ == "__main__":
    socketio.run(app, debug=True) 

