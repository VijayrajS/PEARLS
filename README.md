<h1 align="center">
    <img width="627" height="300" src="PEARLS_banner.png" alt="PEARLS logo"><br>
</h1>

The PEARLS data visualisation is used to provide a conceptual visualisation of high-dimensional data clusters, proposed by Mr. Nahil Jain in 2012. The algorithm aims to extract meaningful information from large quantities of data by clustering them using some already existing clustering algorithm, re-clustering the clusters to form ‘pearls’, which are then assigned a particular shape, and placed in 3D space with respect to the centroid of the cluster. For a more detailed description of the algorithm, refer to ‘Visual Analysis of High Dimensional Real Data - Nahil Jain, 2012’.

# Setting the PEARLS toolkit up locally
## Prerequirements
Make sure the following are installed in the system running
* Python (version >= 3.6) (For backend)
* npm (version >= 6.14.5) (For frontend)
* node (version >= 12.18.1) (For frontend)

In order to set up and run the PEARLS app locally, do the following:

### Frontend
For setting up the frontend, do the following in the pearls_frontend folder:

*  ``yarn start`` : Starts the development server.

*  ``yarn build`` : Bundles the app into static files for production.

*  ``yarn test`` : Starts the test runner.

One can begin by typing (while withiin the pearls_frontend folder):
```
  yarn install # Only for the first time setting up the frontend
  yarn start   # Hosts the frontend on localhost:3000
```

