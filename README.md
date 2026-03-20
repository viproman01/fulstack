# Econo Engine

Econo Engine — это упрощенная платформа для эконометрического анализа данных. Приложение позволяет загружать CSV файлы, получать описательную статистику, матрицу корреляций, а также строить линейную регрессию.

## Стек технологий
- **Backend:** Python 3.11+, FastAPI, Pandas, Statsmodels
- **Frontend:** React 18, TypeScript, Vite, Plotly.js
- **Инфраструктура:** Docker, Docker Compose

## Как запустить

### С помощью Docker Compose (Рекомендуется)
1. Убедитесь, что у вас установлен Docker и Docker Compose.
2. Откройте терминал в папке `econo-engine`.
3. Выполните команду:
   ```bash
   docker-compose up --build
   ```
4. После успешного запуска:
   - Фронтенд доступен по адресу: http://localhost:80
   - Бэкенд API и Swagger документация доступны по адресу: http://localhost:8000/docs

### Локальный запуск без Docker

**Запуск Бэкенда:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Запуск Фронтенда:**
```bash
cd frontend
npm install
npm run dev
```
Фронтенд будет доступен по адресу, указанному в терминале Vite (обычно http://localhost:5173).

## Пример датасета (CSV)
Для тестирования функционала можно использовать классический датасет **Iris**:
- Скачать датасет можно здесь: [Iris Dataset (Kaggle)](https://www.kaggle.com/datasets/uciml/iris) или сгенерировать собственный CSV с числовыми колонками.
- В приложении загружайте файл, просматривайте статистику (Min, Max, Mean, Std) и корреляционную матрицу. Для линейной регрессии выберите Target (например, `SepalLengthCm`) и Features (например, `SepalWidthCm`, `PetalLengthCm`).

---
Разработано в рамках тестового задания.
