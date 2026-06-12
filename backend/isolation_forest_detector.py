import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple

class IsolationForestDetector:
    """
    Anomaly detection model for academic integrity risk scoring using Isolation Forest.
    Combines features from stylometry, grade performance, and timing.
    """
    
    def __init__(self, contamination: float = 0.1):
        self.contamination = contamination
        self.model = IsolationForest(contamination=self.contamination, random_state=42)
        self.scaler = StandardScaler()
        
        # State variables for ensuring consistency between fit and predict
        self.feature_keys: List[str] = []
        self.min_score: float = 0.0
        self.max_score: float = 0.0

    def fit(self, X: List[Dict[str, float]], save_path: str = "iforest_model.joblib") -> None:
        """
        Fits the scaler and IsolationForest model to the provided data.
        
        Args:
            X: List of feature dictionaries. Keys must be consistent across all dicts.
            save_path: The file path where the trained model and scaler will be saved.
        """
        if not X:
            raise ValueError("Training data cannot be empty.")
            
        # Extract and sort feature keys to guarantee order consistency
        self.feature_keys = sorted(list(X[0].keys()))
        
        # Convert List[dict] to 2D numpy array
        X_arr = []
        for row in X:
            # Ensure each row has the same keys
            row_vals = [row[k] for k in self.feature_keys]
            X_arr.append(row_vals)
        X_arr = np.array(X_arr)
        
        # Fit scaler and transform data
        X_scaled = self.scaler.fit_transform(X_arr)
        
        # Fit the Isolation Forest model
        self.model.fit(X_scaled)
        
        # Record min and max training scores for 0-100 normalization later
        # score_samples returns negative anomaly scores (lower = more anomalous)
        train_scores = self.model.score_samples(X_scaled)
        self.min_score = float(train_scores.min())
        self.max_score = float(train_scores.max())
        
        # Save model, scaler, and metadata to disk using joblib
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_keys': self.feature_keys,
            'min_score': self.min_score,
            'max_score': self.max_score
        }, save_path)

    def predict(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Predicts the anomaly score and classification for a single student's features.
        
        Args:
            features: Dictionary containing the exact feature keys used during fitting.
            
        Returns:
            Dictionary with anomaly_score (0-100), is_anomaly (bool), and raw_score (float).
        """
        if not self.feature_keys:
            raise ValueError("Model has not been fitted or loaded yet.")
            
        # Validate that all required features are present
        for k in self.feature_keys:
            if k not in features:
                raise ValueError(f"Missing required feature for prediction: {k}")
                
        # Convert to 2D numpy array using consistent feature order
        x_row = np.array([[features[k] for k in self.feature_keys]])
        
        # Scale features
        x_scaled = self.scaler.transform(x_row)
        
        # Get raw sklearn scores
        raw_score = float(self.model.decision_function(x_scaled)[0])
        prediction = self.model.predict(x_scaled)[0]
        
        # sklearn IsolationForest predict returns -1 for anomaly, 1 for normal
        is_anomaly = bool(prediction == -1)
        
        # Map score_samples to 0-100 range (higher = more anomalous)
        # We invert the score distance relative to min/max from training.
        score_sample = float(self.model.score_samples(x_scaled)[0])
        
        if self.min_score == self.max_score:
            anomaly_score = 0.0
        else:
            # (score - max_score) / (min_score - max_score) 
            # If score == min_score (most anomalous in training), result is 1.0 -> 100%
            # If score == max_score (most normal in training), result is 0.0 -> 0%
            normalized = (score_sample - self.max_score) / (self.min_score - self.max_score)
            anomaly_score = np.clip(normalized * 100.0, 0.0, 100.0)
            
        return {
            "anomaly_score": float(anomaly_score),
            "is_anomaly": is_anomaly,
            "raw_score": float(raw_score)
        }

    def load(self, path: str) -> None:
        """
        Loads the saved model, scaler, and metadata from disk.
        """
        data = joblib.load(path)
        self.model = data['model']
        self.scaler = data['scaler']
        self.feature_keys = data['feature_keys']
        self.min_score = data['min_score']
        self.max_score = data['max_score']


def generate_dummy_data() -> Tuple[List[Dict[str, float]], List[Dict[str, float]]]:
    """
    Generates synthetic feature data for 50 normal students and 2 test students 
    (one normal, one anomalous).
    """
    np.random.seed(42)
    train_data = []
    
    # 50 "normal" student submissions
    for _ in range(50):
        student = {
            "avg_sentence_length": float(np.random.normal(15.0, 2.0)),
            "type_token_ratio": float(np.random.normal(0.6, 0.05)),
            "flesch_reading_ease": float(np.random.normal(60.0, 10.0)),
            "z_score_grade": float(np.random.normal(0.0, 0.5)),
            "time_spent_mins": float(np.random.normal(120.0, 20.0))
        }
        train_data.append(student)
        
    test_data = []
    
    # Test Case 1: Normal behavior
    test_data.append({
        "avg_sentence_length": 14.5,
        "type_token_ratio": 0.62,
        "flesch_reading_ease": 58.0,
        "z_score_grade": 0.1,
        "time_spent_mins": 115.0
    })
    
    # Test Case 2: Anomalous behavior (Contract Cheating / AI Generation)
    test_data.append({
        "avg_sentence_length": 35.0, # very long sentences
        "type_token_ratio": 0.95,    # extremely rich vocabulary
        "flesch_reading_ease": 20.0, # very complex reading level
        "z_score_grade": 3.5,        # huge grade jump from history
        "time_spent_mins": 5.0       # impossibly fast completion time
    })
    
    return train_data, test_data


if __name__ == "__main__":
    # Example execution testing the generated dummy data
    print("Initializing detector...")
    detector = IsolationForestDetector(contamination=0.1)
    
    print("Generating dummy data (50 students)...")
    train_data, test_data = generate_dummy_data()
    
    model_save_path = "dummy_iforest_model.joblib"
    print(f"Fitting model and saving to {model_save_path}...")
    detector.fit(train_data, save_path=model_save_path)
    
    print("Loading model from disk to verify load()...")
    loaded_detector = IsolationForestDetector()
    loaded_detector.load(model_save_path)
    
    print("\n--- Predictions ---")
    for i, test_student in enumerate(test_data):
        result = loaded_detector.predict(test_student)
        status = "ANOMALY" if result["is_anomaly"] else "NORMAL"
        
        print(f"Student {i+1} ({status}):")
        print(f"  Risk Score (0-100): {result['anomaly_score']:>6.2f}")
        print(f"  Raw sklearn score:  {result['raw_score']:>6.4f}")
        print()
