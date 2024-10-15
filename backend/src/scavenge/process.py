import os
import tensorflow as tf
from .scavenge_classes import answers


def predict_class(image_data):

    classifier = os.path.join(
        os.getcwd(), "backend/src/scavenge/landmark_classifier.keras"
    )
    # Load the saved model
    model = tf.keras.models.load_model(classifier)

    # Preprocess the new image (resize to 224x224 and rescale pixel values)
    image = tf.image.resize(image_data, (224, 224))  # Resize the image
    image = tf.cast(image, tf.float32) / 255.0  # Rescale pixel values to [0, 1]
    image = tf.expand_dims(image, axis=0)  # Add batch dimension

    # Make predictions on the new image
    predictions = model.predict(image)
    predicted_class_index = tf.argmax(predictions, axis=-1)
    predicted_class_index_value = predicted_class_index.numpy()[0]

    predicted_answer = answers[predicted_class_index_value]
    print(predictions)
    return predicted_class_index_value, predicted_answer, predictions
