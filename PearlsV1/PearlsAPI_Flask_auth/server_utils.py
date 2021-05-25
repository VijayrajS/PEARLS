from hashlib import sha512


def return_hash(string):
    return sha512(string.encode('utf-8')).hexdigest()
