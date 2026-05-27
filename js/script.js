/* 
   script.js — Form validation for contact.html


/* --- HELPER: showError ---
   Displays a validation message below a specific form field.
   
   Parameters:
     fieldId  — the 'id' of the input element (e.g. "name")
     message  — the error string to display, or "" to clear the error

   Why a helper function?
   Rather than repeating the same DOM queries and class toggles
   for every field, we write it once and call it with different
   arguments. This follows the DRY principle (Don't Repeat Yourself). */
function showError(fieldId, message) {
  /* Get the input element and its matching error container.
     The error containers use a naming convention: "error-" + fieldId
     e.g. fieldId "name" → error container id "error-name" */
  var field      = document.getElementById(fieldId);
  var errorSpan  = document.getElementById("error-" + fieldId);

  if (message) {
    /* Validation FAILED for this field:
       - Write the error message into the <span> below the input
       - Add the CSS class that turns the input border red */
    errorSpan.textContent = message;
    field.classList.add("input-error");
  } else {
    /* Validation PASSED (or field is being reset):
       - Clear the error message
       - Remove the red border class */
    errorSpan.textContent = "";
    field.classList.remove("input-error");
  }
}


/* --- MAIN FUNCTION: validateForm ---
   Called by the form's onsubmit handler: onsubmit="return validateForm()"
   
   Returns:
     false — if any field is invalid (prevents form submission,
              keeps the user on the page to fix errors)
     false — even on success (we handle submission via localStorage
              ourselves and don't want a page reload)

   Why return false on success too?
   Because we are storing data in localStorage and showing a success
   message ourselves. Returning true would trigger a real HTTP form
   submit, which reloads or navigates away from the page. */
function validateForm() {

  /* --- STEP 1: Read field values ---
     .trim() removes leading/trailing whitespace so a field
     containing only spaces doesn't count as filled in. */
  var name    = document.getElementById("name").value.trim();
  var phone   = document.getElementById("phone").value.trim();
  var email   = document.getElementById("email").value.trim();
  var message = document.getElementById("message").value.trim();

  /* --- STEP 2: Reset all previous errors ---
     Before running new checks we clear any errors from a
     previous failed submit attempt. This prevents stale
     messages appearing for fields the user has already fixed. */
  showError("name",    "");
  showError("phone",   "");
  showError("email",   "");
  showError("message", "");

  /* isValid tracks whether the whole form passes.
     We use a flag (rather than returning early on the first error)
     so that ALL errors are shown at once — better UX than showing
     one error at a time. */
  var isValid = true;


  /* --- CHECK 1: Empty fields ---
     We check each field individually so the error appears
     directly below the empty field, not in a generic message. */
  if (!name) {
    showError("name", "Please enter your full name.");
    isValid = false;
  }

  if (!phone) {
    showError("phone", "Please enter your phone number.");
    isValid = false;
  }

  if (!email) {
    showError("email", "Please enter your email address.");
    isValid = false;
  }

  if (!message) {
    showError("message", "Please enter a message before submitting.");
    isValid = false;
  }

  /* If any field is empty, stop here.
     No point running format checks on blank values. */
  if (!isValid) {
    return false;
  }


  /* --- CHECK 2: Name format ---
     Pattern: ^ = start of string
               [A-Za-z\s] = only letters (upper or lower) and spaces
               + = one or more characters
               $ = end of string
     
     Why this pattern?
     Names should not contain numbers or symbols. The \s allows
     spaces so multi-word names like "Maria Silva" are valid. */
  var namePattern = /^[A-Za-z\s]+$/;
  if (!namePattern.test(name)) {
    showError("name", "Name must contain only letters and spaces.");
    isValid = false;
  }


  /* --- CHECK 3: Phone number format ---
     Pattern: ^ = start
               [0-9] = only digits
               {7,15} = between 7 and 15 digits (covers Irish and international formats)
               $ = end
     
     Why 7–15 digits?
     Irish mobile numbers are 10 digits (e.g. 087 123 4567),
     but the original 9–10 limit was too strict — some valid
     Irish landlines are shorter. 15 is the E.164 international maximum. */
  var phonePattern = /^[0-9]{7,15}$/;
  if (!phonePattern.test(phone)) {
    showError("phone", "Phone must be 7–15 digits (numbers only, no spaces).");
    isValid = false;
  }


  /* --- CHECK 4: Email format ---
     Pattern: ^[^\s@]+ = one or more chars that are NOT whitespace or @
               @        = the @ symbol (required)
               [^\s@]+  = domain name part
               \.       = a literal dot
               [^\s@]+$ = top-level domain (e.g. "com", "ie")
     
     Why not use type="email" alone?
     Browser validation is inconsistent and can be bypassed.
     Having our own JS check gives us control over the error message
     and styling. We use novalidate on the form for this reason. */
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showError("email", "Please enter a valid email address (e.g. name@example.com).");
    isValid = false;
  }


  /* If any format check failed, stop and let the user correct errors */
  if (!isValid) {
    return false;
  }


  /* 
     ALL CHECKS PASSED — save and confirm submission
    */

  /* --- SAVE TO LOCALSTORAGE ---
     We build a submission object and add it to an array stored
     in localStorage. This persists the data between page loads
     without needing a server (suitable for this CA stage).
     
     Why localStorage?
     It gives us a simple way to demonstrate data persistence
     in a front-end only context. In the full stack version,
     this will be replaced by a POST request to the Node.js server. */
  var newSubmission = {
    name:    name,
    email:   email,
    message: message,
    date:    new Date().toLocaleDateString("en-IE")  /* Irish date format: dd/mm/yyyy */
  };

  /* Retrieve existing submissions from localStorage.
     JSON.parse converts the stored string back into an array.
     If no submissions exist yet, default to an empty array []. */
  var submissions = JSON.parse(localStorage.getItem("submissions")) || [];

  /* Add the new submission to the array */
  submissions.push(newSubmission);

  /* Save the updated array back to localStorage as a JSON string */
  localStorage.setItem("submissions", JSON.stringify(submissions));


  /* --- SHOW SUCCESS MESSAGE ---
     We reveal the hidden success paragraph in the DOM instead of
     using alert(), which is intrusive and cannot be styled.
     This is the FIX for the original code where the alert was
     placed outside the function and never executed. */
  var successMsg = document.getElementById("success-message");
  if (successMsg) {
    successMsg.style.display = "block";
  }

  /* Reset the form fields to their default empty state */
  document.getElementById("contactForm").reset();

  /* Return false to prevent the form from doing a real HTTP submit
     (which would reload or navigate away from the page) */
  return false;
}
