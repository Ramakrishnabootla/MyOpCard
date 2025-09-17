// Dynamically load hospitals from hospitals.json
fetch('hospitals.json')
  .then(response => response.json())
  .then(hospitals => {
    const list = document.querySelector('.hospital-list');
    if (!list) return;
    list.innerHTML = '<h3>Available Hospitals</h3>' + hospitals.map(hospital => `
      <div class="hospital-card-cmr">
        <div class="hospital-card-header">${hospital.name}</div>
        <div class="hospital-card-location">${hospital.location}</div>
        <a href="../services/services.html?hospital=${hospital.id}" class="hospital-card-btn">Select</a>
      </div>
    `).join('');
  });
