# test-evolution.sh
BASE_URL="https://whatsapp-api-production-8261.up.railway.app"
API_KEY="TU_API_KEY"
INSTANCE="test-instance"
TEST_NUMBER="573001234567"  # número al que enviar mensajes de prueba

echo "=== 1. Health check ==="
curl -s "$BASE_URL" | jq .

echo "=== 2. Estado de la instancia ==="
curl -s "$BASE_URL/instance/connectionState/$INSTANCE" \
  -H "apikey: $API_KEY" | jq .

echo "=== 3. Enviar mensaje de texto ==="
curl -s -X POST "$BASE_URL/message/sendText/$INSTANCE" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_NUMBER\", \"text\": \"Test Evolution API - texto\"}" | jq .

echo "=== 4. Enviar imagen ==="
curl -s -X POST "$BASE_URL/message/sendMedia/$INSTANCE" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_NUMBER\", \"mediatype\": \"image\", \"media\": \"https://picsum.photos/400\", \"caption\": \"Test imagen\"}" | jq .

echo "=== 5. Enviar audio ==="
curl -s -X POST "$BASE_URL/message/sendWhatsAppAudio/$INSTANCE" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_NUMBER\", \"media\": \"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3\"}" | jq .

echo "=== 6. Enviar ubicación ==="
curl -s -X POST "$BASE_URL/message/sendLocation/$INSTANCE" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_NUMBER\", \"latitude\": 3.4516, \"longitude\": -76.5320, \"name\": \"Cali, Colombia\"}" | jq .

echo "=== 7. Verificar número en WhatsApp ==="
curl -s -X POST "$BASE_URL/chat/whatsappNumbers/$INSTANCE" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"numbers\": [\"$TEST_NUMBER\"]}" | jq .

echo "=== DONE ==="
