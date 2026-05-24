

/* --- Here Function to validate the form fields ---
   This function is called when the user clicks "Submit";
   It checks whether the entered data is valid before submitting */
   function validateForm() {
      // Get the form fields
      //Gets the value of each field by its "id" defined in the HTML

      var name  = document.getElementById("name").value;
      var phone = document.getElementById("phone").value;
      var email = document.getElementById("email").value;
      var message = document.getElementById("message").value;
      // now we will validate name and check if name field is empty or not;
  
      /* Gets the error paragraph to display messages to the user */
      var error = document.getElementById("error");
  
  
      /* --- CHECK 1: Empty fields ---
         Checks if any field is empty.
         The "!" symbol means "not". If the field is empty, the if block runs it was easier for me (write just once) */
      if (!name || !phone || !email || !message) {
          error.textContent = "Please fill all informations.";
          return false; // this will prevent form from submission
      }
  
  
      /* --- CHECK 2: Name ---
         Checks if the name contains only letters and spaces.
         The pattern /^[A-Za-z\s]+$/ means:
         ^ = start, [A-Za-z] = uppercase and lowercase letters,
         \s = spaces allowed, + = one or more characters, $ = end */
      var namepattern = /^[A-Za-z\s]+$/;
      if (!namepattern.test(name)) {
          error.textContent = "Name must contain only letters and spaces.";
          return false; /* Cancels the form submission */
      }
  
      /* --- CHECK 3: Phone ---
         Checks if the phone number contains only digits and has 9 or 10 digits.
         The pattern /^[0-9]{9,10}$/ means:
         ^ = start, [0-9] = digits only,
         {9,10} = between 9 and 10 digits, $ = end */
      var phonepattern = /^[0-9]{9,10}$/;
      if (!phonepattern.test(phone)) {
          error.textContent = "Phone number must be 9 or 10 digits (numbers only).";
          return false; /* Cancels the form submission */
      }

      /* --- CHECK 4: email ---
         Checks if the email  contains only "/^[^\s@]+@[^\s@]+\.[^\s@]+$/" the pattern. */
      
      // regular expression for email validation;
      var emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
      if (!emailpattern.test(email)) {
         error.textContent = "Invalid email";
         return false;
      }
  
   // here we built the new submission object
      var newSubmission= {
         name: name,
         email: email,
         message: message,
         date: new Date().toLocaleDateString() // for timestamp
      };
      // here we will get the existing submissions from the localsorage (or empty arr).

      var submission= JSON.parse(localStorage.getItem("submission")) || [];

      // now we are going to add the submission into the array

      submission.push(newSubmission);
      // now we save this update arayback to the local storage

      localStorage.setItem("submission",JSON.stringify(submission));
      document.getElementById("contactForm").reset();

      return false

   }
  
      /* if everthying works well:
        Clears the error message and shows a confirmation to the user */
      error.textContent = "";
      alert("Thank you the form was submitted successfully! We will be in touch soon.");
      return true; /* Allows the form submission */
  