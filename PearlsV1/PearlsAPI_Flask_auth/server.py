
# using flask_restful
import werkzeug
from flask import Flask, jsonify, request, flash, Response, make_response
from flask_restful import Resource, Api

import uuid
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# imports for PyJWT authentication
import jwt
from datetime import datetime, timedelta
from functools import wraps

import os
import json

from CoreCode.DataContainers.Dataset import Dataset
from CSVRangeDetector import returnDomainsJSON
from JSONconverter import DatasetToJSON
from ClusterReclusterer import DataDimensioning
from server_utils import return_hash

from config import Config

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String

UPLOAD_FOLDER = './media'
CLUSTER_JSON_FOLDER = './clustered_data'

ALLOWED_EXTENSIONS = set(['csv', 'json'])

# creating the flask app
app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)

# Database ORMs


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(80))


# creating an API object
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
api = Api(app)
db.create_all()

test = True

# AUTH related
# decorator for verifying the JWT


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if test:
            return f(*args, **kwargs)
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401

        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.filter_by(
                public_id=data['public_id']).first()
        except:
            return jsonify({
                'message': 'Token is invalid !!'
            }), 401
        # returns the current logged in users contex to the routes
        return f(current_user, *args, **kwargs)

    return decorated


def enable_CORS(response, allowed_methods):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', allowed_methods)
    return response


# making a class for a particular resource
# the get, post methods correspond to get and post requests
# they are automatically mapped by flask_restful.
# other methods include put, delete, etc.


class Login(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    def post(self):
        # creates dictionary of form data
        auth = request.json

        if not auth or not auth['email'] or not auth['password']:
            # returns 401 if any email or/and password is missing
            return make_response(
                'Could not verify',
                401,
                {'WWW-Authenticate': 'Basic realm ="Login required !!"'}
            )

        user = User.query.filter_by(email=auth['email']).first()

        if not user:
            # returns 401 if user does not exist
            return make_response(
                'Could not verify',
                401,
                {'WWW-Authenticate': 'Basic realm ="User does not exist !!"'}
            )

        if check_password_hash(user.password, auth['password']):
            # generates the JWT Token
            token = jwt.encode({
                'public_id': user.public_id,
                'exp': datetime.utcnow() + timedelta(minutes=30)
            }, app.config['SECRET_KEY'])

            return enable_CORS(make_response(jsonify({'token': token.decode('UTF-8'), 'name': user.name}), 201), 'POST')

        # returns 403 if password is wrong
        return make_response(
            'Could not verify',
            403,
            {'WWW-Authenticate': 'Basic realm ="Wrong Password !!\"'}
        )


class Register(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    def post(self):
        # creates a dictionary of the form data
        data = request.json

        # gets name, email and password
        name, email = data['name'], data['email']
        password = data['password']

        # checking for existing user
        user = User.query.filter_by(email=email).first()

        if not user:
            # database ORM object
            user = User(
                public_id=str(uuid.uuid4()),
                name=name,
                email=email,
                password=generate_password_hash(password)
            )
            # insert user
            db.session.add(user)
            db.session.commit()

            os.mkdir(os.path.join(UPLOAD_FOLDER, return_hash(email)))
            os.mkdir(os.path.join(CLUSTER_JSON_FOLDER, return_hash(email)))

            return enable_CORS(make_response('Successfully registered.', 201), 'POST')
        else:
            # returns 202 if user already exists
            return enable_CORS(make_response('The inputted email is already in use.', 202), 'POST')

# ----------------


class UploadCSV(Resource):
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    @token_required
    def post(self):
        file = request.files['file']
        email = request.form['email']
        if file.filename == '':
            # No filename
            message = json.dumps({'response': 'No selected file'})
            response = Response(message, status=400,
                                mimetype='application/json')
            response = enable_CORS(response, 'POST')
            return response

        if file and not UploadCSV.allowed_file(file.filename):
            # Invalid file type
            message = json.dumps({'response': 'Invalid file'})
            response = Response(message, status=422,
                                mimetype='application/json')
            response = enable_CORS(response, 'POST')
            return response

        file_path = os.path.join(
            app.config['UPLOAD_FOLDER'], return_hash(email), file.filename)
        file.save(file_path)

        with open(file_path) as fp:
            attrs = [u.strip() for u in fp.readline().split(',')]

        message = json.dumps(
            {
                'response': 'Success',
                'fieldList': attrs,
            })

        response = Response(message, status=200, mimetype='application/json')
        response = enable_CORS(response, 'POST')
        return response


class ClusteringService(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    @token_required
    def post(self):
        metadata = request.json
        filename = metadata['filename']
        email = metadata['email']

        dataset_object = Dataset(os.path.join(
            UPLOAD_FOLDER, return_hash(email), filename))
        dataset_object.load_dataset()
        dataset_object.set_metadata(metadata)

        dataset_object.create_clusters()
        json_converter = DatasetToJSON()

        json_obj = json_converter.convert_dataset_to_JSON(dataset_object)
        filename = os.path.join(CLUSTER_JSON_FOLDER, return_hash(email),
                                filename.split('.')[0]+'.json')

        with open(filename, 'w') as fp:
            fp.write(json_obj)

        message = json.dumps(
            {
                'response': 'Success',
                'n_clusters': dataset_object.number_of_clusters,
            })

        response = Response(message, status=200, mimetype='application/json')
        response = enable_CORS(response, 'POST')
        return response

# New Service to return appropriate cluster


class RetrieveCluster(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    @token_required
    def post(self):
        metadata = request.json
        email = metadata['email']
        filename = metadata['filename'].split('.')[0] + '.json'

        cluster_json_path = os.path.join(
            CLUSTER_JSON_FOLDER, return_hash(email), filename)

        with open(cluster_json_path, 'r') as fp:
            data = json.load(fp)

        cluster_number = metadata['currentCluster']
        message = json.dumps(data['clusters'][cluster_number])
        response = Response(message, status=200, mimetype='application/json')
        response = enable_CORS(response, 'POST')
        return response


class RetrieveDomains(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    @token_required
    def post(self):
        metadata = request.json
        print(metadata)
        email = metadata['email']

        filename = metadata['filename']
        file_path = os.path.join(
            app.config['UPLOAD_FOLDER'], return_hash(email), filename)

        domainJSON = returnDomainsJSON(file_path)
        response = Response(domainJSON, status=200,
                            mimetype='application/json')
        response = enable_CORS(response, 'POST')
        return response


class RetrieveHeaders(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    @token_required
    def post(self):
        metadata = request.json
        email = metadata['email']

        filename = metadata['filename']

        file_path = os.path.join(
            app.config['UPLOAD_FOLDER'], return_hash(email), filename)
        with open(file_path, 'r') as fp:
            header_list = [u.strip() for u in fp.readline().strip().split(',')]

        response = Response(json.dumps(
            {'headers': header_list}), status=200, mimetype='application/json')
        response = enable_CORS(response, 'POST')
        return response


class ReclusterClusters(Resource):
    def options(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    @token_required
    def post(self):
        metadata = request.json
        print(metadata)

        #! WHAT TO DO FOR SELECTED PEARLS
        reclustered_cluster = DataDimensioning(
            metadata, CLUSTER_JSON_FOLDER, UPLOAD_FOLDER)
        # Save cluster later if required
        email = metadata["email"]

        JSON_file = os.path.join(CLUSTER_JSON_FOLDER, return_hash(
            email), metadata["filename"].split('.')[0] + '.json')

        data = None
        with open(JSON_file, 'r') as fp:
            data = json.load(fp)

        data["clusters"][metadata["cluster_no"]] = reclustered_cluster
        with open(JSON_file, 'w') as fp:
            fp.write(json.dumps(data))

        rmessage = json.dumps(reclustered_cluster)
        response = Response(rmessage, status=200, mimetype='application/json')
        response = enable_CORS(response, 'POST')
        return response


# adding the defined resources along with their corresponding urls
api.add_resource(UploadCSV, '/upload')
api.add_resource(ClusteringService, '/cluster')
api.add_resource(RetrieveCluster, '/rcluster')
api.add_resource(RetrieveDomains, '/rdomains')
api.add_resource(RetrieveHeaders, '/rheaders')
api.add_resource(ReclusterClusters, '/rcc')

api.add_resource(Login, '/login')
api.add_resource(Register, '/register')

# driver function
if __name__ == '__main__':
    app.secret_key = os.urandom(24)
    app.run(debug=True)
