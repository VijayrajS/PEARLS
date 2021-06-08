from hashlib import sha512


def return_hash(string):
    """
        Function to return the SHA512 hash of a string
    """
    return sha512(string.encode('utf-8')).hexdigest()
