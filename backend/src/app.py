import asyncio
import os
import re
import cv2
import traceback

import numpy as np
from flask import jsonify, request, Flask, Response, send_file, send_from_directory
from flask_cors import CORS
import pyppeteer
from urllib.parse import urlparse

from scavenge.scavenge import get_answer, save_image, process_image

from pimage import PImage
from pvideo import PVideo

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


def get_company_from_id(identifier):
    user_mapping = {
        "a864b84": "Coalition",
        "1918ebf": "Pacific Salmon Foundation",
        "844c86a": "Overflow",
        "1e84da4": "Khan Academy",
        "fb718d5": "Aspect Biosystems",
        "e8ee4fa": "Tucows",
        "e8e8ee7": "Wavelo",
        "9b0d1a2": "Scribd",
        "8e3fcf7": "DataVisor",
        "61926ea": "Replicant Inc",
        "f788e4d": "MineSense",
        "b687e92": "Grafana Labs",
        "6280ffa": "Voltus",
        "14c4c1a": "Ecobee",
        "fd359f0": "Gladiate Law",
        "dbcd85a": "Run As You Are",
        "f41fe5b": "Rally",
        "4157060": "Mechanical Orchard",
        "5d689cc": "BC Public Service",
        "a2ebe4d": "Imperva",
        "a3b8219": "Grammarly",
        "f93f2b6": "Floatplane Media",
        "af10ec5": "VersaFile",
        "a3367b6": "EvenUp",
        "a864b80": "BC Ministry of Finance",
        "a3b8280": "Amazon",
        "a234c83": "Thale",
        "4c9ec9a": "Lime",
        "14c4c2b": "UVX Inc",
        "1234567": "Test Company",
    }
    return user_mapping.get(identifier, "UnknownUser")


def get_message(company):
    user_message_mapping = {
        "D-Wave": "hello quantum",
        "Pacific Salmon Foundation": "red fish",
        "Stripe": "banks",
        "Khan Academy": "school",
        "Aspect Biosystems": "bio",
        "Tucows": "Tucows",
        "Wavelo": "Wavelo",
    }
    return user_message_mapping.get(company, "Generic welcome message")


def get_company_site(company):
    user_site_mapping = {
        "D-Wave": "https://www.dwavesys.com/",
        "Pacific Salmon Foundation": "https://psf.ca/about/#av_section_3",
        "Stripe": "https://stripe.com/en-ca",
        "Khan Academy": "https://blog.khanacademy.org/computing/",
    }
    return user_site_mapping.get(company, "https://example.com/")


def get_job_title(company):
    user_site_mapping = {
        "D-Wave": "feefef/",
        "Pacific Salmon Foundation": "efefef",
        "Overflow": "Full Stack Engineer",
        "Khan Academy": "Fullstack Engineer II",
        "Aspect Biosystems": "Fullstack Software Engineer",
        "Tucows": "Full Stack Engineer",
        "Wavelo": "Software Engineer",
        "Scribd": "Full stack Software Engineer",
        "DataVisor": "Software Engineer",
        "Replicant Inc": "Software Engineer",
        "MineSense": "Intermediate Software Developer",
        "Grafana Labs": "Web Developer",
        "Voltus": "Backend Software Engineer",
        "Ecobee": "Software Engineer",
        "Coalition": "Software Engineer",
        "Gladiate Law": "Back-End Engineer",
        "Run As You Are": "Full Stack Developer",
        "Rally": "Intermediate Full-Stack Engineer",
        "Mechanical Orchard": "Software Engineer",
        "BC Public Service": "ISL 24R - Full Stack Developer",
        "Imperva": "Junior Software Engineer",
        "Grammarly": "Full-Stack Software Engineer",
        "Floatplane Media": "Jr. Back-End Developer",
        "VersaFile": "Front End UI Developer",
        "EvenUp": "Frontend Software Engineer",
        "BC Ministry of Finance": "ISL 24R - Intermediate Software Developer",
        "Amazon": "Front-End Engineer II",
        "Thale": "Full Stack Developer",
        "Lime": "Software Engineer",
        "UVX Inc": "Frontend Developer",
        "Test Company": "test job",
    }
    return user_site_mapping.get(company, "https://example.com/")


def get_cover_letter_file_name(company):
    user_filename_mapping = {
        "D-Wave": "D-Wave_CoverLetter.pdf",
        "Pacific Salmon Foundation": "D-Wave_CoverLetter.pdf",
        "Stripe": "D-Wave_CoverLetter.pdf",
        "Khan Academy": "Khan-Academy-CL.pdf",
        "Aspect Biosystems": "Aspect_Bio.pdf",
        "Tucows": "Tucows Cover Letter.pdf",
        "Wavelo": "Wavelo Cover Letter.pdf",
        "Scribd": "Scribd Cover Letter.pdf",
        "Test Company": "Aspect_Bio.pdf",
        "DataVisor": "DataVisor Cover Letter.pdf",
        "Replicant Inc": "Replicant Cover Letter.pdf",
        "MineSense": "MineSense Cover Letter.pdf",
        "Grafana Labs": "Grafana Cover Letter.pdf",
        "Ecobee": "Ecobee Cover Letter.pdf",
        "Voltus": "Voltus Cover Letter.pdf",
        "Coalition": "Coalition Cover Letter.pdf",
        "Overflow": "Overflow Cover Letter.pdf",
        "Gladiate Law": "Gladiate Cover Letter.pdf",
        "Run As You Are": "Run Cover Letter.pdf",
        "Rally": "Rally Cover Letter.pdf",
        "Mechanical Orchard": "Mechanical Cover Letter.pdf",
        "Imperva": "Imperva Cover Letter.pdf",
        "Grammarly": "Grammarly Cover Letter.pdf",
        "Floatplane Media": "Floatplane Cover Letter.pdf",
        "VersaFile": "VersaFile Cover Letter.pdf",
        "EvenUp": "EvenUp Cover Letter.pdf",
    }
    return user_filename_mapping.get(company, "none.pdf")


@app.route("/api/setup-user", methods=["POST"])
def get_company():
    try:
        user_identifier = request.form.get("u")
        company = get_company_from_id(user_identifier)
        with open("companies.txt", "a") as file:
            file.write(company + "\n")
        return company
    except Exception as e:
        app.logger.error(f"Error: {str(e)}")
        app.logger.error("Stack trace:")
        traceback.print_exc()

        return str(e), 500


@app.route("/api/get-message", methods=["POST"])
def get_user_message():
    try:
        company = request.form.get("ut")
        user_message = get_message(company)
        company_site = get_company_site(company)
        job_title = get_job_title(company)
        return jsonify(
            {
                "user_message": user_message,
                "company_site": company_site,
                "job_title": job_title,
            }
        )
    except Exception as e:
        app.logger.error(f"Error: {str(e)}")
        app.logger.error("Stack trace:")
        traceback.print_exc()

        return str(e), 500


@app.route("/api/get-cover-letter", methods=["POST"])
def get_cover_letter():
    company_name = request.form.get("ut")
    relative_coverletter_path = "backend/public/coverletters"
    coverletter_folder = os.getcwd()
    pdf_name = get_cover_letter_file_name(company_name)
    pdf_path = os.path.join(coverletter_folder, relative_coverletter_path, pdf_name)

    # Check if the PDF file exists
    if os.path.exists(pdf_path):
        return send_file(
            pdf_path,
            as_attachment=True,
            mimetype="application/pdf",
            download_name="cover_letter.pdf",
        )
    else:
        return "PDF not found", 404


async def capture_screenshot(url, screenshot_path, width):
    # screenshot_path = os.path.join(temp_dir, 'screenshot.png')
    browser = await pyppeteer.launch(
        args=[
            "--no-sandbox",
            "--single-process",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
        ],
        handleSIGINT=False,
        handleSIGTERM=False,
        handleSIGHUP=False,
        headless=True,
    )
    page = await browser.newPage()
    await page.goto(url)
    await page.waitFor(750)
    await page.setViewport({"width": width, "height": 0})
    await page.screenshot({"fullPage": True, "path": screenshot_path})
    await browser.close()
    return screenshot_path


def sanitize_filename(url, width):
    # Remove characters that are not allowed in filenames
    safe_chars = re.sub(r"[^\w\s.-]", "", url)
    return f"{safe_chars}-{width}.png"


@app.route("/api/capture", methods=["POST"])
def capture():
    try:
        data = request.get_json()
        url = data.get("url")
        width = int(data.get("width"))

        # Validate that the provided URL is well-formed
        if not url or urlparse(url).scheme not in ("http", "https"):
            return jsonify({"error": "Invalid URL parameter"}), 500

        relative_screenshot_path = "backend/public/tmp"
        screenshot_folder = os.getcwd()
        safe_url = sanitize_filename(url, width)
        screenshot_path = os.path.join(
            screenshot_folder, relative_screenshot_path, safe_url
        )

        # Check if the file already exists
        if os.path.exists(screenshot_path):
            return send_file(screenshot_path, as_attachment=True)

        asyncio.run(capture_screenshot(url, screenshot_path, width))
        return send_file(screenshot_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": "Invalid URL parameter"}), 500


# Define a route for the root path
@app.route("/")
def home():
    return "Hello from Flask!"


def _process_image(
    imageFile,
    filterFile,
    low,
    high,
    direction,
    inFilter,
    createVideo,
    blend,
    bleed,
    interval_type,
    path_type,
    path_amp,
    path_x,
    path_freq,
    starburst=None,
    show_edges=None,
    use_mask=True,
):
    # Open the image using cv2
    img = cv2.imdecode(np.frombuffer(imageFile.read(), np.uint8), cv2.IMREAD_COLOR)
    alpha_channel = np.full((img.shape[0], img.shape[1]), 255, dtype=np.uint8)
    img_with_alpha = cv2.merge([img, alpha_channel])
    if use_mask:
        filt = cv2.imdecode(
            np.frombuffer(filterFile.read(), np.uint8), cv2.IMREAD_UNCHANGED
        )
    else:
        filt = np.zeros_like(img_with_alpha)
        inFilter = True
    if createVideo:
        return PVideo.create_video(
            img_with_alpha,
            filt,
            low,
            high,
            direction,
            inFilter,
            blend,
            bleed,
            interval_type,
            path_type,
            starburst,
            180,
        )
    return PImage.process_frame(
        img_with_alpha,
        filt,
        low,
        high,
        direction,
        inFilter,
        blend,
        bleed,
        interval_type,
        path_type,
        path_amp,
        path_x,
        path_freq,
        starburst,
        show_edges,
    )


def send_processed_image(img):
    #  convert the processed image back to bytes
    _, img_encoded = cv2.imencode(".jpg", img)
    return Response(
        img_encoded.tobytes(), mimetype="image/jpeg", headers={"Content-Type": "image"}
    )


def send_processed_video(video_path):

    return send_file(
        video_path,
        as_attachment=True,
        download_name="processed_video.mp4",
        mimetype="video/mp4",
    )


@app.route("/api/process-image", methods=["POST"])
def pictor_process_image():

    if "imageFile" not in request.files:
        return "No file part"

    try:
        imageFile = request.files["imageFile"]
        filterFile = request.files["filterFile"]
        inFilter = request.form.get("inFilter").lower() == "true"
        interval_type = request.form.get("intervalType")
        createVideo = request.form.get("createVideo").lower() == "true"
        blend = request.form.get("blend").lower() == "true"
        show_edges = request.form.get("showEdges").lower() == "true"
        use_mask = request.form.get("useMask").lower() == "true"
        bleed = float(request.form.get("bleed"))
        low = int(request.form.get("low"))
        high = int(request.form.get("high"))
        direction = int(request.form.get("direction"))
        path_type = request.form.get("pathType")
        path_amp = int(request.form.get("pathAmp"))
        path_x = int(request.form.get("pathX"))
        path_freq = int(request.form.get("pathFreq"))

        star_point_str = request.form.get("starPoint")
        starburst = None
        if star_point_str:
            x_str, y_str = star_point_str.split(",")
            x = int(float(x_str))  # Convert to float first to handle decimal values
            y = int(float(y_str))
            starburst = [x, y]

        print("processing...")
        processed_data = _process_image(
            imageFile,
            filterFile,
            low,
            high,
            direction,
            inFilter,
            createVideo,
            blend,
            bleed,
            interval_type,
            path_type,
            path_amp,
            path_x,
            path_freq,
            starburst,
            show_edges,
            use_mask,
        )
        print("returning...")
        if createVideo:
            return send_processed_video(processed_data)
        return send_processed_image(processed_data)

    except Exception as e:
        app.logger.error(f"Error: {str(e)}")
        # Print the entire stack trace
        app.logger.error("Stack trace:")
        traceback.print_exc()

        return str(e), 500


@app.route("/api/scavenge-process-image", methods=["POST"])
def scavenge_process_image():
    return process_image()


@app.route("/api/scavenge-save-image", methods=["POST"])
def scavenge_save_image():
    return save_image()


@app.route("/api/fetch-final-answer", methods=["POST"])
def scavenge_get_answer():
    return get_answer()


# Define the API route
@app.route("/api/data", methods=["GET"])
def get_data():
    # Load the image using cv2
    image_path = os.path.join(app.root_path, "public", "default.jpg")
    original_image = cv2.imread(image_path)

    # Return the processed image as a response
    _, processed_image = cv2.imencode(".jpg", original_image)
    return Response(processed_image.tobytes(), mimetype="image/jpeg")


def main():
    app.run()


if __name__ == "__main__":
    main()
