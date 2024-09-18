document.addEventListener("DOMContentLoaded", () => {
    //É ativado quando a página é completamente carregada no navegador
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("login-message");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/authenticated", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // Caso o status da resposta não seja 200 OK
                const errorData = await response.json();
                loginMessage.textContent = `Erro: ${errorData.message || "Erro ao tentar autenticar."}`;
                loginMessage.style.color = "red";
            } else {
                // Sucesso na autenticação
                const data = await response.json();
                loginMessage.style.color = "green";
                alert(data.message);
                loginMessage.textContent = data.message;
                window.location.href = `/home?authToken=${data.authToken}`;

                // Redireciona para a página inicial após o login bem-sucedido
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            }
        } catch (error) {
            // Caso haja um erro de rede ou outro problema na solicitação
            loginMessage.textContent = `Erro de rede: ${error.message}`;
            loginMessage.style.color = "red";
        }
    });
});
