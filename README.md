<h1 align="center">
    <img width="627" height="300" src="PEARLS_banner.png" alt="PEARLS logo"><br>
</h1>

The PEARLS data visualisation is used to provide a conceptual visualisation of high-dimensional data clusters, proposed by Mr. Nahil Jain in 2012. The algorithm aims to extract meaningful information from large quantities of data by clustering them using some already existing clustering algorithm, re-clustering the clusters to form ‘pearls’, which are then assigned a particular shape, and placed in 3D space with respect to the centroid of the cluster. For a more detailed description of the algorithm, refer to [‘Visual Analysis of High Dimensional Real Data - Nahil Jain, 2012’](https://faculty.iiit.ac.in/~kamal/thesis_Nahil_Jain.pdf).

The web app for the same has been implemented with ReactJS library on the frontend, and python code on the backend (hosted on the backend). [Click here](https://www.youtube.com/watch?v=lh8wPMyOxVM) to see the demo video.

## Author of original code : [Vijayraj Shanmugaraj](https://github.com/VijayrajS)
## Guide for project: [Kamal Karlapalem](https://faculty.iiit.ac.in/~kamal/)

# Setting the PEARLS toolkit up locally
## Prerequirements
Make sure the following are installed in the system running
* Python (version >= 3.6) (For backend)
* npm (version >= 6.14.5) (For frontend)
* node (version >= 12.18.1) (For frontend)

In order to set up and run the PEARLS app locally, do the following:

## Frontend
For setting up the frontend, do the following in the pearls_frontend folder:

*  ``yarn start`` : Starts the development server.

*  ``yarn build`` : Bundles the app into static files for production.

*  ``yarn test`` : Starts the test runner.

One can begin by typing (while withiin the pearls_frontend folder):
```bash
  yarn install # Only for the first time setting up the frontend
  yarn start   # Hosts the frontend on localhost:3000
```

## Backend
For the backend, go to the PearlsAPI_Flask folder, and run the following

```bash
# Only for the first time setting up the backend
pip install -r requirements.txt
# Run the command below to start the backend
python server.py # Hosts the backend on localhost:5000
```

# Supported API calls for the PEARLS backend API
The pearls backend API as of now has the following calls incorporated in it:
(*Note : all requests are POST requests unless explicitly mentioned, each POST call involves a JSON being sent to the backend (for parameters)*)

(*Note : all requests also need a JWT token attached with it under the ``x-access-token`` field in the request header to ther server.*)

## UploadCSV
The CSVs that are being uploaded from the frontend usually end up in a common folder named ‘media'. This request entails a ``.csv`` file with it, which gets saved in the ‘media’ folder.

## ClusteringService
This is used to cluster an existing file in the ‘media’ folder. On making this request, the server generates a JSON file with the same name as the CSV file with the cluster data stored as a json in the ‘clustered_data’ folder.

## RetrieveCluster
This call is used to retrieve a particular cluster from a particular file that has already been uploaded to the media folder and been clustered (and hence, JSON file corresponding to the CSV file exists in the clustered_data folder).

## RetrieveDomains
This API call is used to retrieve the name of each column that is of a numerical (integer/ float type) and the range of the data in the column. This was created for providing input to the Parallel coordinates chart that appears for each cluster.

## RetrieveHeaders
This API call returns the names of all the column names i.e the headers of the CSV file mentioned in the request.

## ReclusterClusters
This call is used to recluster a particular cluster with a subset of selected pearls, along with binning options (see the data dimensioning section in Nahil Jain's thesis).

For more details on the backend, check the documentation in the repository root.

# Issues and further work
* **Dealing with the file system** : As of now, the system is stateless, with files being added to the corresponding user's folder, but the user cannot access previously uploaded files. An API call to do the same, and necessary additions to the frontend can be done.
* **Vulnerabilities and security concerns** : The toolkit works fine as it is on a local context. But, a web app is designed for a server deployment, and security is a main concern (especially for valuable datasets etc.). Basic JWT token security has been provided, but flaws may still persist. Such flaws can be fixed in further iterations.
* **Better testing strategies for the entire toolkit** : As of now, there are no proper test cases to test the app and the correctness of the backend. A testing strategy (and a CI/CD pipeline-like setup if possible) can be implemented for the same.
* **Graceful error handling for any corner cases found** : Due to the lack of a strategy, there might be some bugs in the system, which may return some generic errors. Such workflows can be detected, and more informative error messages can be added for the same.
* **Better parallel-coordinates plot component** : As of now, the frontend uses the [react-vis](https://uber.github.io/react-vis/) for displaying a parallel coordinates plot for a given cluster. The framework seems to be rendering the plots, but without labels. For now a workaround has been done, but a custom component for the same would be favourable.
* **Issues with the 3D-plots** : For now, users can select a pearl by using a dropdown menu. Previously, a hover-to-select pearl was implemented in three.js. However, this was extremely slow. Identifying the bottlenecks and re-introducing this feature would be favourable.

