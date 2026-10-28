#!/bin/bash
cd "$(dirname "$0")"

# Otwórz w domyślnej przeglądarce lub Google Chrome
if command -v xdg-open > /dev/null; then
    xdg-open index.html
elif flatpak list | grep -q "com.google.Chrome"; then
    flatpak run com.google.Chrome index.html
else
    echo "Otwórz plik index.html w swojej ulubionej przeglądarce:"
    echo "file://$(pwd)/index.html"
fi
