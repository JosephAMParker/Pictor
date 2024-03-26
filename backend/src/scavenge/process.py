import tensorflow as tf
from .scavenge_classes import landmarks

def predict_class(image_path):
    # Load the saved model
    model = tf.keras.models.load_model('landmark_classifier.h5')

    # Preprocess the new image (resize to 224x224 and rescale pixel values)
    image = tf.keras.preprocessing.image.load_img(image_path, target_size=(224, 224))
    image = tf.keras.preprocessing.image.img_to_array(image)
    image = image / 255.0  # Rescale pixel values to [0, 1]
    image = tf.expand_dims(image, axis=0)  # Add batch dimension

    # Make predictions on the new image
    predictions = model.predict(image)
    predicted_class_index = tf.argmax(predictions, axis=-1)
    predicted_class_index_value = predicted_class_index.numpy()[0]

    predicted_class = landmarks[predicted_class_index_value]
    return predicted_class