document.querySelector('.register-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the page from refreshing when submitted

  // Retrieve input values
  const nickname = document.getElementById('nickname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // check if any of the fields are empty
    if (nickname === '' || email === '' || password === '')
      throw new Error('Please fill in all fields');

    // Convert input values into a JSON object
    const formDataJson = JSON.stringify({ nickname, password, email });

    // sending the data to the backend
    const res = await fetch('auth/register', {
      method: 'POST',
      body: formDataJson,
    });
    // if response was not 200 get the error message and throw an error
    if (!res.ok) {
      const errorMessage = await res.text(); // or res.json if the server response was a json
      throw new Error(errorMessage);
    }

    // After successful register and login, redirect the user to the home page
    window.location.href = '/';
  } catch (error) {
    document.getElementById("error").innerHTML = error.message
  }
});
