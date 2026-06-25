#!/bin/bash

# Kill background processes on exit
trap "kill 0" EXIT

echo "🚀 Lancement de l'écosystème AKEL Banque..."

# Démarrage du Backend
echo "📡 Démarrage du Backend sur le port 4000..."
npm start &

# Attente que le backend soit prêt
sleep 3

# Démarrage du Frontend
echo "💻 Démarrage du Frontend sur le port 3050..."
cd frontend && npm run dev &

# Garder le script actif
wait
