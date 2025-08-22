from flask import Flask, render_template, request
import os

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/history")
def history():
    return render_template("history.html")

@app.route("/water")
def water():
    return render_template("water.html")

@app.route("/calculator", methods=["GET", "POST"])
def calculator():
    result = None
    error = None
    
    if request.method == "POST":
        try:
            # Get form data (this is where Python magic happens!)
            num1 = float(request.form["number1"])
            num2 = float(request.form["number2"]) 
            operation = request.form["operation"]
            
            # Python calculation happens here
            if operation == "add":
                result = num1 + num2
            elif operation == "subtract":
                result = num1 - num2
            elif operation == "multiply":
                result = num1 * num2
            elif operation == "divide":
                if num2 != 0:
                    result = num1 / num2
                else:
                    error = "Cannot divide by zero!"
            else:
                error = "Invalid operation!"
            
        except ValueError:
            error = "Please enter valid numbers!"
        except KeyError:
            error = "Missing form data!"
    
    return render_template("calculator.html", result=result, error=error)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
else:
    # Production configuration
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
