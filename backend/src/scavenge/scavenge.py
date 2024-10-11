import os
import cv2 
import numpy as np
import tensorflow as tf 
import matplotlib.pyplot as plt 
from keras import layers,models
from flask import jsonify, request
from .process import predict_class

def process_image():

    if 'imageFile' not in request.files:
        return 'No file part', 500
    
    try:
        imageFile = request.files['imageFile']
        img  = cv2.imdecode(np.frombuffer(imageFile.read(), np.uint8), cv2.IMREAD_COLOR) 
        landmark = predict_class(img)
        return jsonify({'landmark': landmark})
    
    except Exception as e:
        return str(e), 500
    
def save_image():
    if 'imageFile' not in request.files:
        return 'No file part', 500
    
    try: 
        image_file = request.files['imageFile']
        directory_name = request.form['directoryName'] 
        
        relative_directory_path = 'backend/public/train/' + directory_name  
        
        base_folder = os.getcwd()
        directory_path = os.path.join(base_folder, relative_directory_path)

        if not os.path.exists(directory_path):
            os.makedirs(directory_path) 

        idx = len(os.listdir(directory_path)) 
        image_name = directory_name + '_' + str(idx) + '.jpg'
        image_path = os.path.join(directory_path, image_name) 
         
        image_file.save(image_path)
        return 'Image saved successfully', 200
    
    except Exception as e:
        return str(e), 500

def train():
    # Define paths to dataset
    train_dir = './train'
    val_dir = './validate'

    num_of_classes = len(next(os.walk(train_dir))[1])

    # Define image dimensions and batch size
    img_width, img_height = 224, 224
    batch_size = 6
    epochs=12

    # Create data generators for training and validation with data augmentation
    train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='categorical'
    )

    val_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='categorical'
    )

    # Define the CNN architecture
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(img_width, img_height, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.Dense(num_of_classes, activation='softmax')  # Number of classes (landmarks)
    ])

    # Compile the model
    model.compile(optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy'])

    # Train the model
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // batch_size,
        epochs=epochs,
        validation_data=val_generator,
        validation_steps=val_generator.samples // batch_size
    )

    # Save the trained model
    model.save('landmark_classifier.h5')

    # Plot training history
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']

    epochs = range(1, len(acc) + 1)

    plt.plot(epochs, acc, 'bo', label='Training acc')
    plt.plot(epochs, val_acc, 'b', label='Validation acc')
    plt.title('Training and validation accuracy')
    plt.legend()

    plt.figure()

    plt.plot(epochs, loss, 'bo', label='Training loss')
    plt.plot(epochs, val_loss, 'b', label='Validation loss')
    plt.title('Training and validation loss')
    plt.legend()

    plt.show()
