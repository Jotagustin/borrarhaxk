import io
from fastapi.testclient import TestClient
from PIL import Image, ExifTags
from main import app, DB_PATH
import os

client = TestClient(app)

def test_flow():
    # 1. Crear una imagen sin EXIF
    img = Image.new("RGB", (100, 100), color=(255, 69, 0))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    response = client.post(
        "/clasificar",
        files={"file": ("fuego_noexif.jpg", img_bytes, "image/jpeg")},
        data={"fuente": "celular", "lat": -33.4569, "lng": -70.6483},
    )

    assert response.status_code == 200
    json_data = response.json()
    print("Test 1 (Sin EXIF):", json_data["veredicto_final"], json_data["origen"]["dispositivo"])
    assert json_data["origen"]["dispositivo"] == "Sin metadatos EXIF (posible captura de pantalla o descarga web)"

    # 2. Crear una imagen con EXIF simulado
    exif = img.getexif()
    # 271 is Make, 272 is Model, 306 is DateTime
    exif[0x010F] = "DJI"
    exif[0x0110] = "Mavic 3 Pro"
    exif[0x0132] = "2026:11:19 15:30:00"

    img_byte_arr_exif = io.BytesIO()
    img.save(img_byte_arr_exif, format="JPEG", exif=exif)
    img_bytes_exif = img_byte_arr_exif.getvalue()

    response2 = client.post(
        "/clasificar",
        files={"file": ("dron_exif.jpg", img_bytes_exif, "image/jpeg")},
        data={"fuente": "dron", "lat": -33.5123, "lng": -70.7891},
    )
    assert response2.status_code == 200
    json_data2 = response2.json()
    print("Test 2 (Con EXIF):", json_data2["veredicto_final"], json_data2["origen"]["dispositivo"], json_data2["origen"]["fecha_captura"])
    assert "DJI Mavic 3 Pro" in json_data2["origen"]["dispositivo"]

    # 3. Verificar listado
    hist_response = client.get("/incidentes")
    assert hist_response.status_code == 200
    items = hist_response.json()
    assert len(items) >= 2
    print(f"Total incidentes registrados en SQLite: {len(items)}")
    print("ALL INTEGRATION TESTS PASSED!")

if __name__ == "__main__":
    test_flow()
