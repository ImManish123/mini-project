const fs = require('fs');
const file = 'c:/Users/balam/Downloads/mini project/mini project extract/frontend/src/pages/customer/BookingDetail.js';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* Status Timeline */}'));
const endIdx = lines.findIndex(l => l.includes('{/* Booking Details */}'));

const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx);

const newMiddle = [
  '            {/* Status Timeline */}',
  '            {booking.status !== \'CANCELLED\' && (',
  '              <div className=\"card border-0 shadow-sm mb-4\">',
  '                <div className=\"card-body p-4\">',
  '                  <h5 className=\"fw-bold mb-4\">Booking Status</h5>',
  '                  <div className=\"status-timeline\">',
  '                    {statuses.map((status, idx) => (',
  '                      <div key={status} className={\	imeline-step \\}>',
  '                        <div className=\"timeline-dot\"></div>',
  '                        <span className=\"timeline-label\">{status.replace(/_/g, \' \')}</span>',
  '                      </div>',
  '                    ))}',
  '                  </div>',
  '                </div>',
  '              </div>',
  '            )}',
  '',
  '            {/* Worker Live Location Map */}',
  '            {workerLocation && booking.status === \'ON_THE_WAY\' && (',
  '              <div className=\"card border-0 shadow-sm mb-4\" style={{border: \'2px solid #0d6efd\'}}>',
  '                <div className=\"card-body p-4\">',
  '                  <h5 className=\"fw-bold mb-3 text-primary d-flex align-items-center\">',
  '                    <FaMapMarkerAlt className=\"me-2 text-danger\" />',
  '                    Worker Live Location',
  '                    <span className=\"badge bg-danger ms-auto\" style={{animation: \'pulse 2s infinite\'}}>LIVE</span>',
  '                  </h5>',
  '                  <div style={{ height: \'300px\', borderRadius: \'12px\', overflow: \'hidden\' }}>',
  '                    <MapContainer center={[workerLocation.latitude, workerLocation.longitude]} zoom={15} style={{ height: \'100%\', width: \'100%\' }}>',
  '                      <TileLayer url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\" />',
  '                      <Marker position={[workerLocation.latitude, workerLocation.longitude]}>',
  '                        <Popup>Worker is en route...</Popup>',
  '                      </Marker>',
  '                    </MapContainer>',
  '                  </div>',
  '                </div>',
  '              </div>',
  '            )}',
  ''
];

const newLines = [...before, ...newMiddle, ...after];
fs.writeFileSync(file, newLines.join('\n'));
console.log('Fixed file');
