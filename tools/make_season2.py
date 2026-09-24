#!/usr/bin/env python3
"""Génère la saison 2 : Vigenère + RSA + message final chiffré (AES-GCM).

Usage (depuis la racine du site) :  python3 tools/make_season2.py
Ça réécrit js/season2.js et met à jour N et C dans index.html.
Chaque lancement génère de nouveaux nombres premiers.
"""
import base64, hashlib, os, re, secrets
from math import gcd
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ---------- À MODIFIER ----------
KEY = "GUSTAVE"
PLAIN = ("THE ARCHITECT SPLIT HIS KEY IN THREE. ONE PIECE SLEEPS IN THE SOURCE. "
         "ONE SPEAKS IN THE CONSOLE. ONE HIDES IN THE DARK. "
         "THE DOOR WAS LOCKED WITH TWO PRIMES. PRESS ENTER WHEN YOU HOLD THE NUMBER.")
ANSWER = 18891930          # la solution à taper dans la boîte de dialogue
AFTER = ("THE ARCHITECT IS PLEASED.\n"
         "SEASON 3 IS NOT ON THIS PAGE.\n"
         "THE NEXT DOOR IS A FILE. ITS NAME IS THE NUMBER YOU JUST SPOKE.")
BITS = 48                  # taille de chaque premier (2 x 48 bits = n d'environ 96 bits)
E = 65537
SALT, ITER = "cicada-s2", 200_000
# --------------------------------

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def is_prime(n):
    small = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)
    if n < 2:
        return False
    for p in small:
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in small:
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def rand_prime(bits):
    while True:
        p = secrets.randbits(bits) | (1 << (bits - 1)) | 1
        if is_prime(p):
            return p


# --- RSA ---
while True:
    p, q = rand_prime(BITS), rand_prime(BITS)
    phi = (p - 1) * (q - 1)
    if p != q and gcd(E, phi) == 1:
        break
n = p * q
assert ANSWER < n
c = pow(ANSWER, E, n)
d = pow(E, -1, phi)
assert pow(c, d, n) == ANSWER

# --- Vigenère ---
letters = [ch for ch in PLAIN.upper() if ch.isalpha()]
ct = "".join(chr((ord(ch) - 65 + ord(KEY[i % len(KEY)]) - 65) % 26 + 65) for i, ch in enumerate(letters))
groups = [ct[i:i + 5] for i in range(0, len(ct), 5)]
lines = [" ".join(groups[i:i + 6]) for i in range(0, len(groups), 6)]

# --- Message final chiffré avec la réponse (AES-GCM, clé PBKDF2) ---
key = hashlib.pbkdf2_hmac("sha256", str(ANSWER).encode(), SALT.encode(), ITER, 32)
iv = os.urandom(12)
blob = base64.b64encode(iv + AESGCM(key).encrypt(iv, AFTER.encode(), None)).decode()

# --- Écriture ---
js = "window.S2 = " + repr({"cipher": lines, "salt": SALT, "iter": ITER, "blob": blob}).replace("'", '"') + ";\n"
with open(os.path.join(ROOT, "js", "season2.js"), "w") as f:
    f.write(js)

path = os.path.join(ROOT, "index.html")
html = open(path, encoding="utf-8").read()
html, k1 = re.subn(r"<!-- N = \d+ -->", f"<!-- N = {n} -->", html)
html, k2 = re.subn(r'(<span class="ghost">)C = \d+(</span>)', rf"\g<1>C = {c}\g<2>", html)
assert k1 == 1 and k2 == 1, "marqueurs N / C introuvables dans index.html"
open(path, "w", encoding="utf-8").write(html)

print("Vigenère :", KEY)
print("n =", n, "\ne =", E, "\nc =", c)
print("p =", p, "\nq =", q, "\nd =", d)
print("Réponse à taper :", ANSWER)