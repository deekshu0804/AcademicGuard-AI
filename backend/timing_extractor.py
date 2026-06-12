import datetime
import math
from typing import List, Dict, Union

def extract_timing_features(
    submission_timestamp: datetime.datetime,
    deadline: datetime.datetime,
    student_history: List[datetime.datetime]
) -> Dict[str, Union[float, int, bool]]:
    """
    Extracts behavioral timing anomalies from a student's submission.
    
    Args:
        submission_timestamp (datetime): When the current submission was made.
        deadline (datetime): The assignment deadline.
        student_history (List[datetime]): Timestamps of the student's past submissions.
            Note: To strictly compute the z-score of 'hours_before_deadline', past 
            deadlines would mathematically be required. We assume either the history 
            belongs to this same assignment (drafts) or we evaluate the timing interval 
            if the signature implies fixed deadlines. If not possible to deduce, 
            we safely default it to 0.0 or compute it assuming the same deadline.
            
    Returns:
        Dict containing timing features.
    """
    # 1. hours_before_deadline (negative means late)
    time_delta = deadline - submission_timestamp
    hours_before_deadline = time_delta.total_seconds() / 3600.0
    
    # 2. days_before_deadline
    days_before_deadline = hours_before_deadline / 24.0
    
    # 3. submission_hour
    submission_hour = submission_timestamp.hour
    
    # 4. is_night_submission
    is_night_submission = 0 <= submission_hour <= 5
    
    # 5. weekend_submission
    weekend_submission = submission_timestamp.weekday() >= 5
    
    # Initialize history-dependent features
    timing_z_score = 0.0
    pattern_shift = False
    
    if student_history:
        # Filter out the current submission if it happens to be in the history
        history = [t for t in student_history if t != submission_timestamp]
        
        if len(history) > 0:
            # 6. pattern_shift: >3 std devs from student's usual submission hour distribution
            # Using floats (e.g. 14.5 for 2:30 PM) for continuous mean
            past_hours = [t.hour + t.minute / 60.0 + t.second / 3600.0 for t in history]
            current_hour_float = submission_timestamp.hour + submission_timestamp.minute / 60.0 + submission_timestamp.second / 3600.0
            
            mean_hour = sum(past_hours) / len(past_hours)
            variance_hour = sum((x - mean_hour) ** 2 for x in past_hours) / len(past_hours)
            std_hour = math.sqrt(variance_hour)
            
            if std_hour > 0:
                hour_z_score = abs(current_hour_float - mean_hour) / std_hour
                pattern_shift = hour_z_score > 3.0
            else:
                # If they strictly always submitted at the exact same minute and now deviated
                pattern_shift = current_hour_float != mean_hour

            # 7. timing_z_score: z-score of hours_before_deadline vs student's history
            # Since we only have past submission datetimes and not past deadlines, we calculate
            # the z-score based on the interval relative to this assignment's deadline.
            # This is mathematically sound if student_history represents past drafts for THIS assignment.
            # If they are past assignments, subtracting a single deadline creates skewed data,
            # so we'll gracefully compute it over the derived list.
            past_hbd = [(deadline - t).total_seconds() / 3600.0 for t in history]
            mean_hbd = sum(past_hbd) / len(past_hbd)
            var_hbd = sum((x - mean_hbd) ** 2 for x in past_hbd) / len(past_hbd)
            std_hbd = math.sqrt(var_hbd)
            
            if std_hbd > 0:
                timing_z_score = (hours_before_deadline - mean_hbd) / std_hbd
            else:
                timing_z_score = 0.0

    return {
        "hours_before_deadline": float(hours_before_deadline),
        "submission_hour": int(submission_hour),
        "is_night_submission": bool(is_night_submission),
        "days_before_deadline": float(days_before_deadline),
        "timing_z_score": float(timing_z_score),
        "pattern_shift": bool(pattern_shift),
        "weekend_submission": bool(weekend_submission)
    }

# ==========================================
# UNIT TESTS
# ==========================================
"""
if __name__ == "__main__":
    from datetime import datetime, timedelta
    
    deadline = datetime(2026, 5, 1, 23, 59)
    # Submitted slightly late (next day 00:30) -> Negative hours_before_deadline
    submission = datetime(2026, 5, 2, 0, 30) 
    
    # History of mostly submitting around 14:00 (2 PM)
    history = [
        datetime(2026, 4, 15, 14, 0),
        datetime(2026, 4, 20, 14, 15),
        datetime(2026, 4, 25, 13, 50)
    ]
    
    features = extract_timing_features(submission, deadline, history)
    
    print("Hours before deadline:", features["hours_before_deadline"]) # Should be ~ -0.5
    print("Is night submission:", features["is_night_submission"]) # Should be True
    print("Submission hour:", features["submission_hour"]) # Should be 0
    print("Pattern shift (>3 std devs):", features["pattern_shift"]) # Should be True
    print("Timing z-score:", features["timing_z_score"])
"""
