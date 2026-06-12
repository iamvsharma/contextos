import pandas as pd
import io

def generate_summary(file_bytes):
    df = pd.read_csv(io.BytesIO(file_bytes))

    return {
        "rows": len(df),
        "columns": list(df.columns),
        "missing": df.isnull().sum().to_dict(),
        "sample": df.head(5).to_dict(orient="records")
    }