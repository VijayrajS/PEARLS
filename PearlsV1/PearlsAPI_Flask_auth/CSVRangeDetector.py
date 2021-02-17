import json
import pandas as pd

def returnDomainsJSON(filename):
    """
    A function to return the minimum and maximum values of all headers of numerical 
    (int/float) type headers in the file
    
    Method parameters:
    * filename: Name of the file for which we require the domain information
    
    Output:
    A json of the form {domains: [A list of objects of the form [ColumnName:[MinValue, MaxValue]]]}
    """
    df = pd.read_csv(filename)
    
    # Filtering out int/float type columns
    columns_list = [ col for col in df.columns if df[col].dtypes in ['int', 'float']]
    
    range_list   = [[float(df[col].min()), float(df[col].max())] for col in columns_list]
    range_json = list(zip(columns_list, range_list))
    
    # Returns a domains json with 
    return json.dumps({'domains': range_json})
