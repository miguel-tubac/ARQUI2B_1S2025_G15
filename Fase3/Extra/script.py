import boto3
import base64
from dotenv import load_dotenv
import os

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Configuración de AWS Rekognition y S3
rekognition_client = boto3.client('rekognition', aws_access_key_id=os.getenv("aws_access_key_id"),
                                  aws_secret_access_key=os.getenv("aws_secret_access_key"),
                                  region_name=os.getenv("region_name"))
s3_client = boto3.client('s3',  aws_access_key_id=os.getenv("aws_access_key_id"),
                                aws_secret_access_key=os.getenv("aws_secret_access_key"),
                                region_name=os.getenv("region_name"))

S3_BUCKET_NAME=os.getenv("NAME_BUCKET_S3")

# Funciones para gestionar colecciones
def create_collection():
    try:
        collection_name = input("Ingresa el nombre de la colección a crear: ")
        response = rekognition_client.create_collection(CollectionId=collection_name)
        print(f"Collection created: {response['CollectionArn']}")
    except Exception as e:
        print(f"Error creating collection: {e}")


def delete_collection():
    try:
        response = rekognition_client.list_collections()
        collections = response.get('CollectionIds', [])
        if not collections:
            print("No hay colecciones disponibles para eliminar.")
            return

        print("Colecciones disponibles:")
        for idx, collection in enumerate(collections, start=1):
            print(f"{idx}. {collection}")

        choice = int(input("Selecciona el número de la colección que deseas eliminar: "))
        if 1 <= choice <= len(collections):
            collection_name = collections[choice - 1]
            response = rekognition_client.delete_collection(CollectionId=collection_name)
            if response['StatusCode'] == 200:
                print(f"Collection '{collection_name}' deleted successfully")
            else:
                print(f"Failed to delete collection '{collection_name}'")
        else:
            print("Selección no válida.")
    except Exception as e:
        print(f"Error deleting collection: {e}")


def list_collections():
    try:
        response = rekognition_client.list_collections()
        collections = response.get('CollectionIds', [])
        if collections:
            print("Colecciones disponibles:")
            for collection in collections:
                print(f"- {collection}")
        else:
            print("No hay colecciones disponibles.")
    except Exception as e:
        print(f"Error listing collections: {e}")


def list_faces():
    try:
        collection_name = input("Ingresa el nombre de la colección para listar los rostros: ")
        response = rekognition_client.list_faces(CollectionId=collection_name)
        faces = response.get('Faces', [])
        if faces:
            print("Rostros en la colección:")
            for face in faces:
                print(f"FaceId: {face['FaceId']}, ExternalImageId: {face.get('ExternalImageId', 'N/A')}, Confidence: {face['Confidence']}")
        else:
            print("No se encontraron rostros en la colección.")
    except Exception as e:
        print(f"Error listing faces: {e}")


# Funciones para gestionar folders
def create_folder():
    try:
        folder_name = input("Ingresa el nombre del folder a crear: ")
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=f"{folder_name}/")
        print(f"---Folder '{folder_name}' creado exitosamente.---")
    except Exception as e:
        print(f"Error creando el folder: {e}")


def list_folders():
    try:
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Delimiter='/')
        folders = response.get('CommonPrefixes', [])
        if not folders:
            print("No hay folders disponibles en el bucket.")
            return

        print("Folders disponibles:")
        for folder in folders:
            print(f"- {folder['Prefix']}")
    except Exception as e:
        print(f"Error listando folders: {e}")


def delete_folder():
    try:
        folder_name = input("Ingresa el nombre del folder a eliminar: ")
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=folder_name)
        if 'Contents' not in response:
            print(f"El folder '{folder_name}' no existe o está vacío.")
            return

        # Eliminar todos los objetos dentro del folder
        objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
        s3_client.delete_objects(Bucket=S3_BUCKET_NAME, Delete={'Objects': objects_to_delete})
        print(f"Folder '{folder_name}' eliminado exitosamente.")
    except Exception as e:
        print(f"Error eliminando el folder: {e}")


def upload_image():
    try:
        folder_name = input("Ingresa el nombre del folder donde subir la imagen: ")
        image_name = input("Ingresa el nombre del archivo (incluye la extensión, por ejemplo, imagen.jpg): ")
        image_path = input("Ingresa la ruta local de la imagen: ")

        # Leer la imagen desde el archivo local
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()

        # Subir la imagen al bucket S3
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=f"{folder_name}/{image_name}", Body=image_bytes)
        print(f"Imagen '{image_name}' subida exitosamente al folder '{folder_name}'.")
    except Exception as e:
        print(f"Error subiendo la imagen: {e}")


def index_faces():
    try:
        # Listar folders disponibles
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Delimiter='/')
        folders = response.get('CommonPrefixes', [])
        if not folders:
            print("No hay folders disponibles para indexar imágenes.")
            return

        print("Folders disponibles:")
        for idx, folder in enumerate(folders, start=1):
            print(f"{idx}. {folder['Prefix']}")

        folder_choice = int(input("Selecciona el número del folder para indexar las imágenes: "))
        if 1 <= folder_choice <= len(folders):
            folder_name = folders[folder_choice - 1]['Prefix']
        else:
            print("Selección no válida.")
            return

        # Listar colecciones disponibles
        response = rekognition_client.list_collections()
        collections = response.get('CollectionIds', [])
        if not collections:
            print("No hay colecciones disponibles para indexar imágenes.")
            return

        print("Colecciones disponibles:")
        for idx, collection in enumerate(collections, start=1):
            print(f"{idx}. {collection}")

        collection_choice = int(input("Selecciona el número de la colección donde indexar las imágenes: "))
        if 1 <= collection_choice <= len(collections):
            collection_name = collections[collection_choice - 1]
        else:
            print("Selección no válida.")
            return

        # Indexar imágenes desde el folder seleccionado
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=folder_name)
        if 'Contents' not in response:
            print(f"No se encontraron imágenes en el folder '{folder_name}'.")
            return

        for obj in response['Contents']:
            image_key = obj['Key']
            if image_key == folder_name:  # Ignorar el prefijo del folder
                continue
            print(f"Indexando imagen: {image_key}")
            rekognition_client.index_faces(
                CollectionId=collection_name,
                Image={
                    'S3Object': {
                        'Bucket': S3_BUCKET_NAME,
                        'Name': image_key
                    }
                },
                ExternalImageId=image_key.split('/')[-1],
                DetectionAttributes=['ALL']
            )
        print(f"Imágenes del folder '{folder_name}' indexadas exitosamente en la colección '{collection_name}'.")
    except Exception as e:
        print(f"Error indexando las imágenes: {e}")


# Menús principales
def folder_menu():
    while True:
        print("\nSubmenú de Folders:")
        print("1. Crear folder")
        print("2. Listar folders")
        print("3. Eliminar folder")
        print("4. Subir imagen a folder")
        print("5. Regresar")
        choice = input("Selecciona una opción: ")

        if choice == "1":
            create_folder()
        elif choice == "2":
            list_folders()
        elif choice == "3":
            delete_folder()
        elif choice == "4":
            upload_image()
        elif choice == "5":
            break
        else:
            print("Opción no válida. Intenta de nuevo.")


def collection_menu():
    while True:
        print("\nSubmenú de Colecciones:")
        print("1. Crear colección")
        print("2. Listar colecciones")
        print("3. Eliminar colección")
        print("4. Listar rostros en una colección")
        print("5. Indexar imágenes desde un folder")
        print("6. Regresar")
        choice = input("Selecciona una opción: ")

        if choice == "1":
            create_collection()
        elif choice == "2":
            list_collections()
        elif choice == "3":
            delete_collection()
        elif choice == "4":
            list_faces()
        elif choice == "5":
            index_faces()
        elif choice == "6":
            break
        else:
            print("Opción no válida. Intenta de nuevo.")


if __name__ == "__main__":
    while True:
        print("")
        print("AWS-admin | Rekognition y S3  - Reconocimiento Facial")
        print("-----------------------------------------------------")
        print("\nMenú Principal:")
        print("1. Gestionar folders")
        print("2. Gestionar colecciones")
        print("3. Salir")
        choice = input("Selecciona una opción: ")

        if choice == "1":
            folder_menu()
        elif choice == "2":
            collection_menu()
        elif choice == "3":
            print("Saliendo del programa...")
            break
        else:
            print("Opción no válida. Intenta de nuevo.")