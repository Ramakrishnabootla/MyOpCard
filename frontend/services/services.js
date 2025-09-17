// Dynamically load hospital services based on hospital id in URL
fetch('../hospitals/hospitals.json')
  .then(response => response.json())
  .then(hospitals => {
    const params = new URLSearchParams(window.location.search);
    const hospitalId = params.get('hospital');
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) {
      document.querySelector('.services-list').innerHTML = '<p style="color:red">Hospital not found.</p>';
      document.querySelector('.hero h1').textContent = 'Hospital Services';
      return;
    }
    document.querySelector('.hero h1').textContent = hospital.name + ' Services';
    document.querySelector('.hero-cta').textContent = `Select a service to continue for ${hospital.location}`;
    document.querySelector('.services-list').innerHTML = hospital.services.map(service => `
      <div class="service-card" onclick="location.href='../${service.id}/${service.id}.html?hospital=${hospital.id}'">
        <div class="service-icon">${service.icon}</div>
        <div class="service-title">${service.name}</div>
        <div class="service-desc">${service.desc}</div>
      </div>
    `).join('');
  });
