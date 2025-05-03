from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import boto3
import base64
import paho.mqtt.client as mqtt
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de MongoDB atlas
MONGO_URL = "mongodb+srv://3057827540301:TWLgrK8HfUIigMxR@fase2.8w4xy.mongodb.net/"
client = MongoClient(MONGO_URL)
db = client["Sensores"]

# Configuración del cliente MQTT
mqtt_broker = "broker.emqx.io"
mqtt_port = 1883
mqtt_topic_luz = "Entrada/01"
mqtt_topic_recon_facial = "Entrada/02"

mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"✅ Conectado al broker MQTT con código: {rc}")

mqtt_client.on_connect = on_connect
mqtt_client.connect(mqtt_broker, mqtt_port, 60)
mqtt_client.loop_start()  # 🔥 Mantener cliente en ejecución

# Configuración AWS Rekognition
rekognition_client = boto3.client('rekognition', 
                                  aws_access_key_id=os.getenv("aws_access_key_id"),
                                  aws_secret_access_key=os.getenv("aws_secret_access_key"),
                                  region_name=os.getenv("region_name"))

COLLECTION_ID = os.getenv("name_collection")

@app.route('/compare-faces', methods=['POST'])
def compare_faces():
    try:
        data = request.json
        image_base64 = data.get('image')
        if not image_base64:
            return jsonify({'error': 'No se proporcionó una imagen'}), 400

        if image_base64.startswith('data:image'):
            image_base64 = image_base64.split(',')[1]
        image_bytes = base64.b64decode(image_base64)

        response = rekognition_client.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={'Bytes': image_bytes},
            MaxFaces=1,
            FaceMatchThreshold=80
        )

        face_matches = response.get('FaceMatches', [])
        if face_matches:
            similarity = face_matches[0]['Similarity']
            face_id = face_matches[0]['Face']['ExternalImageId']
            mqtt_client.publish(mqtt_topic_recon_facial, "1")
            return jsonify({'match': True, 'similarity': similarity, 'matched_image': face_id}), 200
        else:
            mqtt_client.publish(mqtt_topic_recon_facial, "0")
            return jsonify({'match': False, 'message': 'No se encontró coincidencia'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/end-data/<sensor_name>", methods=["GET"])
def obtener_ultimo_dato(sensor_name):
    try:
        collection = db[sensor_name]
        sensor_data = collection.find_one({}, {"_id": 0, "timestamp": 1, "value": 1}, sort=[("timestamp", -1)])
        
        if not sensor_data:
            return jsonify({"error": "Datos no encontrados"}), 404
        
        return jsonify(sensor_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin-luces', methods=['POST'])
def admin_luces():
    try:
        data = request.json
        estado = data.get('estado')

        if not isinstance(estado, bool):
            return jsonify({'error': 'Estado inválido. Debe ser true o false.'}), 400
        
        print("Estado recibido:", estado)
        if estado:
            mqtt_client.publish(mqtt_topic_luz, "1", retain=True)
            return jsonify({'message': 'Se encendió la luz correctamente'}), 200
        else:
            mqtt_client.publish(mqtt_topic_luz, "0", retain=True)
            return jsonify({'message': 'Se apagó la luz correctamente'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
