#!/usr/bin/env python3
"""
Eloquent One — Unified Automated Regression Test Suite Runner
Runs all backend test modules and reports test metrics and exit code.
"""

import sys
import unittest

def main():
    print("=" * 70)
    print("      ELOQUENT ONE — AUTOMATED REGRESSION TEST SUITE RUNNER")
    print("=" * 70)
    
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir="tests", pattern="test_*.py")
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 70)
    print(f"  Total Tests Executed : {result.testsRun}")
    print(f"  Passed               : {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  Failed               : {len(result.failures)}")
    print(f"  Errors               : {len(result.errors)}")
    print("=" * 70)
    
    sys.exit(0 if result.wasSuccessful() else 1)

if __name__ == "__main__":
    main()
