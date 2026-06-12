import numpy as np
from typing import List, Dict, Union, Optional

def detect_performance_deviation(
    student_grades: List[float], 
    current_grade: float, 
    course_avg: float
) -> Dict[str, Union[float, str, bool, None]]:
    """
    Analyzes a student's current grade against their historical grades to detect 
    performance anomalies that might indicate academic integrity risks (e.g., contract cheating).
    
    Args:
        student_grades (List[float]): All past grades for this student.
        current_grade (float): The grade for the submission being analyzed.
        course_avg (float): Class average for this assignment.
        
    Returns:
        Dict containing z_score, grade_jump, percentile_shift, vs_class_delta, 
        trend_direction, and anomaly_flag.
    """
    grades_arr = np.array(student_grades) if student_grades else np.array([])
    num_grades = len(grades_arr)
    
    # 1. z_score
    if num_grades > 0:
        mean_grade = np.mean(grades_arr)
        std_grade = np.std(grades_arr)
        if std_grade == 0:
            z_score = 0.0
        else:
            z_score = (current_grade - mean_grade) / std_grade
    else:
        z_score = 0.0
        
    # 2. grade_jump (requires at least 3 historical grades)
    if num_grades >= 3:
        rolling_mean = np.mean(grades_arr[-3:])
        grade_jump = current_grade - rolling_mean
    else:
        grade_jump = None
        
    # 3. percentile_shift
    # Defined as the percentile of the current grade among their historical grades 
    # minus the percentile of their average historical grade among their historical grades.
    if num_grades > 0:
        current_percentile = np.mean(grades_arr <= current_grade) * 100
        mean_grade = np.mean(grades_arr)
        avg_percentile = np.mean(grades_arr <= mean_grade) * 100
        percentile_shift = current_percentile - avg_percentile
    else:
        percentile_shift = 0.0
        
    # 4. vs_class_delta
    vs_class_delta = current_grade - course_avg
    
    # 5. trend_direction (based on last 5 grades + current grade, or just last 5 history?)
    # "based on last 5 grades"
    # We include the current grade as the most recent point in the trend to see the direction.
    trend_window = np.append(grades_arr, current_grade)
    if len(trend_window) >= 2:
        # Take up to the last 5 grades
        recent_grades = trend_window[-5:]
        x = np.arange(len(recent_grades))
        # Fit a 1st degree polynomial (line)
        slope, _ = np.polyfit(x, recent_grades, 1)
        
        # Define a small threshold to avoid calling floating point noise a trend
        if slope > 0.5:
            trend_direction = "improving"
        elif slope < -0.5:
            trend_direction = "declining"
        else:
            trend_direction = "stable"
    else:
        trend_direction = "stable"
        
    # 6. anomaly_flag
    # True if z_score > 2.0 or grade_jump > 20
    is_anomaly = False
    if z_score > 2.0:
        is_anomaly = True
    if grade_jump is not None and grade_jump > 20:
        is_anomaly = True
        
    return {
        "z_score": float(z_score),
        "grade_jump": float(grade_jump) if grade_jump is not None else None,
        "percentile_shift": float(percentile_shift),
        "vs_class_delta": float(vs_class_delta),
        "trend_direction": trend_direction,
        "anomaly_flag": is_anomaly
    }

# ==========================================
# UNIT TESTS
# ==========================================
"""
if __name__ == "__main__":
    # Test case 1: Normal performance
    result1 = detect_performance_deviation(
        student_grades=[80.0, 82.0, 79.0, 85.0, 81.0],
        current_grade=83.0,
        course_avg=75.0
    )
    print("Normal:", result1)
    # Expected: stable or improving, no anomaly
    
    # Test case 2: Sudden anomaly (contract cheating scenario)
    result2 = detect_performance_deviation(
        student_grades=[50.0, 55.0, 52.0, 54.0, 51.0],
        current_grade=95.0,
        course_avg=70.0
    )
    print("Anomaly:", result2)
    # Expected: z_score > 2.0, grade_jump > 20, anomaly_flag = True, trend = improving
    
    # Test case 3: Edge case - fewer than 3 historical grades
    result3 = detect_performance_deviation(
        student_grades=[85.0, 88.0],
        current_grade=90.0,
        course_avg=80.0
    )
    print("Few grades:", result3)
    # Expected: grade_jump = None, anomaly_flag based only on z_score
    
    # Test case 4: Edge case - all same grades (std=0)
    result4 = detect_performance_deviation(
        student_grades=[80.0, 80.0, 80.0, 80.0],
        current_grade=80.0,
        course_avg=80.0
    )
    print("Same grades:", result4)
    # Expected: z_score = 0.0
"""
