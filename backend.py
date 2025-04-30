from flask import Flask, request, send_file
import os, json, zipfile
from io import BytesIO

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate_pkpass():
    data = request.get_json()
    nom = data.get('nom', '').strip()
    if not nom:
        return 'Nom requis', 400

    pass_json = {
        "formatVersion": 1,
        "passTypeIdentifier": "pass.com.example.test",
        "serialNumber": "SN123456",
        "teamIdentifier": "TEAM123",
        "organizationName": "Démo Inc.",
        "description": "Démo Pass",
        "logoText": nom,
        "generic": {
            "primaryFields": [
                {"key": "name", "label": "Nom", "value": nom}
            ]
        }
    }

    icon_data = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63600000020001000500FE2A60570000000049454E44AE426082"
    )

    buffer = BytesIO()
    with zipfile.ZipFile(buffer, 'w') as z:
        z.writestr("pass.json", json.dumps(pass_json, indent=2))
        z.writestr("icon.png", icon_data)
    buffer.seek(0)

    return send_file(buffer, mimetype='application/vnd.apple.pkpass', as_attachment=True, download_name='mon_pass.pkpass')

if __name__ == "__main__":
    app.run(debug=True)
