import os
import cv2
import numpy as np
from flask import jsonify, request
from .process import predict_class
from .scavenge_classes import landmarks


def process_image():

    if "imageFile" not in request.files:
        return "No file part", 500

    try:
        imageFile = request.files["imageFile"]
        clueID = request.form["clueID"]
        img = cv2.imdecode(np.frombuffer(imageFile.read(), np.uint8), cv2.IMREAD_COLOR)
        predict_id, answer = predict_class(img)
        predict_id_str = str(predict_id)
        if clueID == predict_id_str:
            return jsonify({"answer": answer, "clueID": predict_id_str})
        return jsonify(
            {
                "answer": "INCORRECT",
                "clueID": predict_id_str,
                "wrong": landmarks[predict_id],
            }
        )

    except Exception as e:
        return str(e), 500


def save_image():
    if "imageFile" not in request.files:
        return "No file part", 500

    try:
        image_file = request.files["imageFile"]
        directory_name = request.form["directoryName"]

        relative_directory_path = "../public/train/" + directory_name

        base_folder = os.getcwd()
        directory_path = os.path.join(base_folder, relative_directory_path)

        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

        idx = len(os.listdir(directory_path))
        image_name = directory_name + "_" + str(idx) + ".jpg"
        image_path = os.path.join(directory_path, image_name)

        image_file.save(image_path)
        return "Image saved successfully", 200

    except Exception as e:
        return str(e), 500
