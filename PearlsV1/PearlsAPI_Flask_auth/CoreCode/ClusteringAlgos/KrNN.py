import sys
from collections import defaultdict, Counter

import numpy as np

sys.path.append(".")
from .ClusteringAlgorithm import ClusteringAlgoTemplate
from sklearn.neighbors import NearestNeighbors

class Graph:
    """A class that represents a graph data structure
    """
    def __init__(self, graph, n_nodes):
        self.graph_dict = graph
        self.number_of_nodes = n_nodes
        self.visited_list = [0] * (n_nodes + 1)
        
    def reversed_graph(self):
        """Function that returns a graph, which has the same nodes and edges as
           the original graph, but the edges are reversed in direction.
           
           Output: A Graph object with the edges directing in the opposite directions
           of the original graph
        """
        new_graph = defaultdict(list)
        
        for node in self.graph_dict:
            for neighbour in self.graph_dict[node]:
                new_graph[neighbour].append(node)
        
        return Graph(new_graph, self.number_of_nodes)

def depth_first_search(graph, starting_node, stack):
    """A simple depth first search function that builds a depth first search stack
       for the strongly connected components algorithm.
       
       Method parameters:
       * graph: A graph object for which the DFS must be run
       * starting_node: The starting node index for the DFS
       * stack: The DFS stack that is being constructed
    """
    graph.visited_list[starting_node] = 1
    
    if starting_node in graph.graph_dict:
        for vertex in graph.graph_dict[starting_node]:
            if not graph.visited_list[vertex] and vertex in graph.graph_dict:
                depth_first_search(graph, vertex, stack)
    
    stack.append(starting_node)

def strongly_connected_components(graph):
    """Function to find the strongly connected components of a graph

       Function parameters:
       * graph: A graph object for which the strongly connected components need
         to be generated.

       Output: A list of lists, each list corresponding to the indices of vertices 
       belonging to a single strongly connected component.
    """

    components = []
    search_stack = []

    for vertex in range(len(graph.visited_list)):
        if not graph.visited_list[vertex] and vertex in graph.graph_dict:
            depth_first_search(graph, vertex, search_stack)

    # Reverse traversal with the search_stack built to identify components
    reversed_graph = graph.reversed_graph()
    while search_stack:
        stack_top = search_stack[-1]
        scc_stack = []
        
        depth_first_search(reversed_graph, stack_top, scc_stack)
        for vertex in scc_stack:
            if vertex in reversed_graph.graph_dict:
                del reversed_graph.graph_dict[vertex]
            search_stack.remove(vertex)
        
        components.append(scc_stack)
    return components

class KrNNClustering(ClusteringAlgoTemplate):
    @staticmethod
    def construct_KrNN_list(neighbour_index_list):
        """Function to create the reverse neighbour list given the neighbour list

           Method parameters:
           * neighbour_index_list: A dictionary which consists of the neighbour
             list of all points in the graph

           Output: A dictionary which consists of the reverse-neighbour list
           of all points in the graph
        """
        reverse_neighbours_list = defaultdict(list)
        
        for i in range(len(neighbour_index_list)):
            for neighbour in neighbour_index_list[i]:
                reverse_neighbours_list[neighbour].append(i)
        
        return reverse_neighbours_list
    
    @staticmethod
    def identify_densepoints_outliers(KrNN_list, k):
        """Function that segregates points in data as dense points or outliers
           on the basis of the length of their reverse-neighbour list.

           Method parameters:
           * KrNN_list: A dictionary which consists of the reverse-neighbour list
             of all points in the graph
           * k: The parameter k in the KrNN clustering algorithm

           Output:
           Two dictionaries, corresponding to dense points and their adjacency lists,
           and outliers and their adjacency lists
        """
        dense_points = {}
        outliers = {}
        
        for node in KrNN_list:
            if len(KrNN_list[node]) >= k:
                dense_points[node] = KrNN_list[node]
            else:
                outliers[node] = KrNN_list[node]
        
        return dense_points, outliers
        
    @staticmethod
    def create_clusters(Data, metadata, cluster_or_pearl="Cluster"):
        """Method that returns cluster labels based on the KrNN (K-Reverse Nearest 
        Neighbors driven clustering) algorithm as devised by Dr. Soujanya Vadapalli

        Note: See the ClusteringAlgoTemplate class for explanation of parameters
        and outputs
        """

        # Selecting parameter k
        if cluster_or_pearl == "Cluster":
            k = metadata['KrNN_k_for_clustering']
        else:
            k = metadata['KrNN_k_for_pearling']

        Data = np.array(Data)

        # If k is greater than the number of data points, this algorithm is equivalent
        # to setting k as the number of data points itself

        if k >= len(Data):
            k = len(Data)

        # Getting reverse neighbours list
        nearest_neighbours = NearestNeighbors(n_neighbors=k, algorithm='auto').fit(Data)
        distances, neighbour_indices = nearest_neighbours.kneighbors(Data)
        KrNN_list = KrNNClustering.construct_KrNN_list(neighbour_indices)

        # Identifying list of dense points and outliers.
        # These are dictionaries which have the node number, and its corresponding
        #  KrNN adjacency lists.

        dense_point_list, outlier_list = \
            KrNNClustering.identify_densepoints_outliers(KrNN_list, k)

        dense_points_graph = Graph(dense_point_list, len(Data))

        clusters = [sorted(cluster) for cluster in
                        strongly_connected_components(dense_points_graph)]

        cluster_labels = [-1] * len(Data)
        cluster_point_list = defaultdict(list)
        
        min_limit = np.ceil(k/Data.shape[1])
        
        for cluster_number in range(len(clusters)):
            for point in clusters[cluster_number]:
                cluster_labels[point] = cluster_number
                cluster_point_list[cluster_number].append(Data[point])

        # Classifying nearby outliers
        for point in outlier_list:
            neighbour_cluster_list = []
            for neighbour in outlier_list[point]:
                if cluster_labels[neighbour] != -1:
                    neighbour_cluster_list.append(cluster_labels[neighbour])
            
            cluster_count = Counter(neighbour_cluster_list).most_common()
            if cluster_count:
                most_common_cluster = cluster_count[0]
                if most_common_cluster[1] >= min_limit:
                    cluster_labels[point] = most_common_cluster[0]

        n_clusters = len(clusters)
        return cluster_labels, n_clusters

if __name__ == '__main__':
    X = np.array([[5, 5], [5, 6], [4, 5], [4, 6], [-5, 5], [-5, 6], [-4, 5],
                  [-4, 6], [5, -5], [5, -6], [4, -5], [4, -6], [-5, -5],
                  [-5, -6], [-4, -5], [-4, -6], [10,10], [5.1,5.1]])

    print(len(X))
    x = X[:,0]
    y = X[:,1]
    
    print(KrNNClustering.create_clusters(X, 4))

    # import matplotlib.pyplot as plt
    # fig = plt.figure()
    # ax = fig.add_subplot(1, 1, 1)
    # ax.scatter(x, y, color='r')
    
    # plt.show()