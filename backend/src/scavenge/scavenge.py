import os
import cv2
import numpy as np
from flask import jsonify, request
from .process import predict_class
from .scavenge_classes import landmarks

FINAL_ANSWER = "coherent"
FINAL_CLUE = "Look inside the Red Rising board game box on the bookshelf"


def process_image():

    if "imageFile" not in request.files:
        return "No file part", 500

    try:
        imageFile = request.files["imageFile"]
        clueID = request.form["clueID"]
        img = cv2.imdecode(np.frombuffer(imageFile.read(), np.uint8), cv2.IMREAD_COLOR)
        predict_id, answer, predictions = predict_class(img)
        predict_id_str = str(predict_id)
        if clueID == predict_id_str:
            return jsonify({"answer": answer, "clueID": predict_id_str})
        return jsonify(
            {
                "answer": "INCORRECT",
                "clueID": predict_id_str,
                "wrong": landmarks[predict_id],
                "vals": "".join([str(e) for e in predictions]),
            }
        )

    except Exception as e:
        return str(e), 500


def get_answer():

    try:
        answer = request.form["answer"]
        answer = answer.lower()

        if answer == FINAL_ANSWER:
            return jsonify({"finalClue": FINAL_CLUE})
    except Exception as e:
        return str(e), 500


def save_image():
    if "imageFile" not in request.files:
        return "No file part", 500

    try:
        image_file = request.files["imageFile"]
        directory_name = request.form["directoryName"]

        relative_directory_path = "backend/public/train/" + directory_name

        base_folder = os.getcwd()
        directory_path = os.path.join(base_folder, relative_directory_path)

        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

        idx = len(os.listdir(directory_path))
        image_name = directory_name + "_" + str(idx) + ".jpg"
        image_path = os.path.join(directory_path, image_name)

        image_file.save(image_path)
        return jsonify({"idx": str(idx)})

    except Exception as e:
        return str(e), 500
