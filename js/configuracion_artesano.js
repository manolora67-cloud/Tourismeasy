document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('artisanContactForm');
    const emailInput = document.getElementById('artisanContactEmail');
    const phoneInput = document.getElementById('artisanContactPhone');
    const status = document.getElementById('artisanContactStatus');
    const submitButton = document.getElementById('artisanContactSubmit');
    const accountId = document.getElementById('artisanAccountId');
    const accountName = document.getElementById('artisanAccountName');
    const accountStatus = document.getElementById('artisanAccountStatus');
    const accountCreated = document.getElementById('artisanAccountCreated');
    if (!form || !emailInput || !phoneInput || !status || !submitButton) return;

    function setStatus(message, isError) {
        status.textContent = message;
        status.classList.toggle('is-error', Boolean(isError));
        status.hidden = !message;
    }

    async function readResponse(response) {
        let data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error('El servidor devolvió una respuesta inválida.');
        }
        if (!response.ok || !data.ok) {
            throw new Error(data.error || 'No se pudo completar la solicitud.');
        }
        return data;
    }

    async function loadProfile() {
        form.setAttribute('aria-busy', 'true');
        submitButton.disabled = true;
        try {
            const response = await fetch('../e-commerce/perfil_artesano.php', {
                credentials: 'include',
                headers: { Accept: 'application/json' }
            });
            const data = await readResponse(response);
            const profile = data.perfil;
            emailInput.value = profile.email || '';
            phoneInput.value = profile.telefono || '';
            emailInput.disabled = false;
            phoneInput.disabled = false;
            if (accountId) accountId.textContent = profile.id_persona_ecommerce || '—';
            if (accountName) accountName.textContent = [profile.nombre, profile.apellido].filter(Boolean).join(' ') || '—';
            if (accountStatus) accountStatus.textContent = profile.estado === 'ACTIVO' ? 'Activa' : (profile.estado || '—');
            if (accountCreated) {
                const date = profile.fecha_registro ? new Date(profile.fecha_registro) : null;
                accountCreated.textContent = date && !Number.isNaN(date.getTime())
                    ? date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—';
            }
            setStatus('', false);
        } catch (error) {
            setStatus(error.message || 'No se pudieron cargar los datos de la cuenta.', true);
        } finally {
            form.removeAttribute('aria-busy');
            submitButton.disabled = false;
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        submitButton.disabled = true;
        setStatus('Guardando tus datos…', false);
        try {
            const response = await fetch('../e-commerce/perfil_artesano.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    telefono: phoneInput.value.trim()
                })
            });
            const data = await readResponse(response);
            emailInput.value = data.email;
            phoneInput.value = data.telefono;
            setStatus(data.mensaje || 'Datos de contacto actualizados correctamente.', false);
        } catch (error) {
            setStatus(error.message || 'No se pudieron actualizar los datos de contacto.', true);
        } finally {
            submitButton.disabled = false;
        }
    });

    loadProfile();
});
