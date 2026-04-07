
// src/services/orthopedicsReportGenerator.js

export const generateOrthopedicsReport = (patientData, allEncounters,isSingleEncounter = false) => {
    if (!patientData) return;

    const reportWindow = window.open('', '_blank');
    
    const styles = `
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }
            .report-container {
                max-width: 1400px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px;
                background: linear-gradient(135deg, #1e4a6b 0%, #2c7da0 100%);
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 32px;
            }
            .header h3 {
                margin: 10px 0 5px;
                font-size: 20px;
            }
            .header p {
                margin: 5px 0;
                opacity: 0.9;
            }
            .summary-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                padding: 20px;
                background: #f8f9fa;
            }
            .summary-card {
                background: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary-card .number {
                font-size: 28px;
                font-weight: bold;
                color: #2c7da0;
            }
            .summary-card .label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
            .section {
                margin-bottom: 30px;
                padding: 0 20px;
                page-break-inside: avoid;
            }
            .section-title {
                background: #2c7da0;
                color: white;
                padding: 12px 20px;
                margin: 0 -20px 20px -20px;
                font-size: 20px;
            }
            .subsection-title {
                background: #e9ecef;
                color: #2c7da0;
                padding: 8px 15px;
                margin: 20px 0 15px 0;
                font-size: 16px;
                border-left: 4px solid #2c7da0;
            }
            .encounter-card {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                margin-bottom: 30px;
                overflow: hidden;
                page-break-inside: avoid;
            }
            .encounter-header {
                background: #f8f9fa;
                padding: 15px;
                border-bottom: 2px solid #2c7da0;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .encounter-header h4 {
                margin: 0;
                color: #1e4a6b;
            }
            .encounter-date {
                color: #666;
                font-size: 14px;
            }
            .encounter-body {
                padding: 20px;
                display: none;
            }
            .encounter-body.show {
                display: block;
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            .info-item {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 5px;
                border-left: 3px solid #2c7da0;
            }
            .info-label {
                font-weight: bold;
                color: #2c7da0;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 8px;
            }
            .info-value {
                font-size: 14px;
                line-height: 1.5;
            }
            .full-width {
                grid-column: 1 / -1;
            }
            .two-columns {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .three-columns {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
            }
            th, td {
                border: 1px solid #dee2e6;
                padding: 10px;
                text-align: left;
                vertical-align: top;
            }
            th {
                background: #e9ecef;
                font-weight: bold;
            }
            .badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: bold;
            }
            .badge-green { background: #d4edda; color: #155724; }
            .badge-red { background: #f8d7da; color: #721c24; }
            .badge-yellow { background: #fff3cd; color: #856404; }
            .badge-blue { background: #d1ecf1; color: #0c5460; }
            .badge-purple { background: #e7d4f5; color: #6f42c1; }
            .badge-orange { background: #ffe5d0; color: #cc7000; }
            .footer {
                margin-top: 30px;
                padding: 20px;
                border-top: 1px solid #dee2e6;
                text-align: center;
                font-size: 12px;
                color: #666;
                background: #f8f9fa;
            }
            .toggle-button {
                background: #2c7da0;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            }
            .toggle-button:hover {
                background: #1e4a6b;
            }
            @media print {
                body {
                    padding: 0;
                    margin: 0;
                    background: white;
                }
                .no-print {
                    display: none;
                }
                .encounter-body {
                    display: block !important;
                }
                .summary-cards {
                    break-inside: avoid;
                }
                .encounter-card {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
            }
        </style>
    `;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderPainIntensityBar = (intensity) => {
        if (!intensity) return 'N/A';
        const width = (intensity / 10) * 100;
        return `
            <div style="background: #e9ecef; border-radius: 5px; overflow: hidden; margin-top: 5px;">
                <div style="background: ${intensity <= 3 ? '#28a745' : intensity <= 6 ? '#ffc107' : '#dc3545'}; 
                            width: ${width}%; height: 20px; text-align: center; color: white; font-size: 12px; line-height: 20px;">
                    ${intensity}/10
                </div>
            </div>
        `;
    };

    const renderYesNoBadge = (value) => {
        if (!value || value === 'No') return '<span class="badge badge-green">No</span>';
        if (value === 'Yes') return '<span class="badge badge-red">Yes</span>';
        return `<span class="badge badge-blue">${value}</span>`;
    };

    const renderEncounterDetails = (encounter) => {
        const complaints = encounter.complaints || {};
        const physicalExam = encounter.physical_exam || {};
        const imaging = encounter.imaging || {};
        const labs = encounter.labs || {};
        const management = encounter.management || {};
        const notes = encounter.notes || {};
        const referrals = encounter.referrals || {};
        const rehabMilestones = encounter.rehab_milestones || [];

        return `
            <div class="encounter-card">
                <div class="encounter-header" onclick="toggleEncounter(this)">
                    <div>
                        <h4>Encounter #${encounter.encounter.patient_id_at_visit || 'N/A'}</h4>
                        <div class="encounter-date">📅 ${formatDate(encounter.encounter.encounter_date)}</div>
                    </div>
                    <button class="toggle-button no-print">▼ Expand</button>
                </div>
                <div class="encounter-body">
                    
                    <!-- SECTION 1: Presenting Complaint & Symptoms -->
                    <h3 class="subsection-title">1. Presenting Complaint & Symptoms</h3>
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <div class="info-label">Chief Complaint</div>
                            <div class="info-value">${complaints.chief_complaint || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Onset Date</div>
                            <div class="info-value">${formatDateOnly(complaints.onset_date)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Duration</div>
                            <div class="info-value">${complaints.duration || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Progression</div>
                            <div class="info-value">${complaints.progression || 'N/A'}</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Pain Location</div>
                            <div class="info-value">${complaints.pain_location || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Pain Intensity</div>
                            <div class="info-value">${renderPainIntensityBar(complaints.pain_intensity)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Pain Type</div>
                            <div class="info-value">${complaints.pain_type || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Pain Radiation</div>
                            <div class="info-value">${complaints.pain_radiation || 'N/A'}</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Swelling</div>
                            <div class="info-value">${renderYesNoBadge(complaints.swelling)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Redness</div>
                            <div class="info-value">${renderYesNoBadge(complaints.redness)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Warmth</div>
                            <div class="info-value">${renderYesNoBadge(complaints.warmth)}</div>
                        </div>
                    </div>

                    ${complaints.trauma_mechanism ? `
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Trauma Mechanism</div>
                            <div class="info-value">${complaints.trauma_mechanism}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Time Since Injury</div>
                            <div class="info-value">${complaints.trauma_time || 'N/A'}</div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Functional Limitation</div>
                            <div class="info-value">${complaints.functional_limitation || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Mobility Limitation</div>
                            <div class="info-value">${complaints.mobility_limitation || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">ADL Limitation</div>
                            <div class="info-value">${complaints.adl_limitation || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Range of Motion Loss</div>
                            <div class="info-value">${complaints.range_motion_loss || 'N/A'}</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Numbness</div>
                            <div class="info-value">${renderYesNoBadge(complaints.numbness)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Tingling</div>
                            <div class="info-value">${renderYesNoBadge(complaints.tingling)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Weakness</div>
                            <div class="info-value">${renderYesNoBadge(complaints.weakness)}</div>
                        </div>
                    </div>

                    <!-- SECTION 2: Physical Examination -->
                    <h3 class="subsection-title">2. Physical Examination</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Inspection Findings</div>
                            <div class="info-value">${physicalExam.inspection || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Deformity</div>
                            <div class="info-value">${physicalExam.deformity || 'None'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Scars</div>
                            <div class="info-value">${physicalExam.scars || 'None'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Palpation Tenderness</div>
                            <div class="info-value">${physicalExam.palpation_tenderness || 'None'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Warmth on Palpation</div>
                            <div class="info-value">${physicalExam.warmth_on_palpation || 'Normal'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Crepitus</div>
                            <div class="info-value">${physicalExam.crepitus || 'None'}</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Active Flexion</div>
                            <div class="info-value">${physicalExam.rom_active_flexion || 'N/A'}°</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Passive Flexion</div>
                            <div class="info-value">${physicalExam.rom_passive_flexion || 'N/A'}°</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Active Extension</div>
                            <div class="info-value">${physicalExam.rom_active_extension || 'N/A'}°</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Passive Extension</div>
                            <div class="info-value">${physicalExam.rom_passive_extension || 'N/A'}°</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Quadriceps Strength</div>
                            <div class="info-value">${physicalExam.quadriceps_strength || 'N/A'}/5</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Hamstring Strength</div>
                            <div class="info-value">${physicalExam.hamstring_strength || 'N/A'}/5</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Calf Strength</div>
                            <div class="info-value">${physicalExam.calf_strength || 'N/A'}/5</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Pulses</div>
                            <div class="info-value">${physicalExam.pulses || 'Normal'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Sensation</div>
                            <div class="info-value">${physicalExam.sensation || 'Intact'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Motor Function</div>
                            <div class="info-value">${physicalExam.motor_function || 'Normal'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Gait Assessment</div>
                            <div class="info-value">${physicalExam.gait || 'Normal'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Special Tests</div>
                            <div class="info-value">${physicalExam.special_tests || 'None performed'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Joint Instability</div>
                            <div class="info-value">${physicalExam.joint_instability || 'None'}</div>
                        </div>
                    </div>

                    <!-- SECTION 3: Imaging & Investigations -->
                    <h3 class="subsection-title">3. Imaging & Investigations</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">X-Ray</div>
                            <div class="info-value">${renderYesNoBadge(imaging.xray_done)}</div>
                        </div>
                        ${imaging.xray_findings ? `
                        <div class="info-item full-width">
                            <div class="info-label">X-Ray Findings</div>
                            <div class="info-value">${imaging.xray_findings}</div>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <div class="info-label">MRI</div>
                            <div class="info-value">${renderYesNoBadge(imaging.mri_done)}</div>
                        </div>
                        ${imaging.mri_indication ? `
                        <div class="info-item">
                            <div class="info-label">MRI Indication</div>
                            <div class="info-value">${imaging.mri_indication}</div>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <div class="info-label">CT Scan</div>
                            <div class="info-value">${renderYesNoBadge(imaging.ct_done)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Ultrasound</div>
                            <div class="info-value">${renderYesNoBadge(imaging.ultrasound_done)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Bone Density (DEXA)</div>
                            <div class="info-value">${renderYesNoBadge(imaging.dexa_done)}</div>
                        </div>
                    </div>

                    ${labs ? `
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <div class="info-label">Laboratory Tests Ordered</div>
                            <div class="info-value">
                                ${[
                                    labs.cbc_ordered ? 'CBC' : '',
                                    labs.esr_ordered ? 'ESR' : '',
                                    labs.crp_ordered ? 'CRP' : '',
                                    labs.rheumatoid_factor_ordered ? 'Rheumatoid Factor' : '',
                                    labs.uric_acid_ordered ? 'Uric Acid' : '',
                                    labs.calcium_ordered ? 'Calcium' : '',
                                    labs.vitamin_d_ordered ? 'Vitamin D' : '',
                                    labs.alp_ordered ? 'ALP' : ''
                                ].filter(Boolean).join(', ') || 'None'}
                            </div>
                        </div>
                        ${labs.cbc_results ? `
                        <div class="info-item">
                            <div class="info-label">CBC Results</div>
                            <div class="info-value">${labs.cbc_results}</div>
                        </div>
                        ` : ''}
                        ${labs.esr_results ? `
                        <div class="info-item">
                            <div class="info-label">ESR Results</div>
                            <div class="info-value">${labs.esr_results}</div>
                        </div>
                        ` : ''}
                        ${labs.crp_results ? `
                        <div class="info-item">
                            <div class="info-label">CRP Results</div>
                            <div class="info-value">${labs.crp_results}</div>
                        </div>
                        ` : ''}
                        ${labs.other_labs_results ? `
                        <div class="info-item full-width">
                            <div class="info-label">Other Lab Results</div>
                            <div class="info-value">${labs.other_labs_results}</div>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    <!-- SECTION 4: Diagnoses -->
                    <h3 class="subsection-title">4. Diagnoses</h3>
                    ${encounter.diagnoses && encounter.diagnoses.length > 0 ? `
                        ${encounter.diagnoses.filter(d => d.diagnosis_type === 'primary').map(dx => `
                        <div class="info-item" style="background: #fff3cd; margin-bottom: 15px;">
                            <div class="info-label">Primary Diagnosis</div>
                            <div class="info-value" style="font-size: 16px; font-weight: bold;">${dx.diagnosis_name}</div>
                            <div class="three-columns" style="margin-top: 10px;">
                                <div><strong>Affected Side:</strong> ${dx.affected_side || 'N/A'}</div>
                                <div><strong>Affected Joint:</strong> ${dx.affected_joint || 'N/A'}</div>
                                <div><strong>Severity:</strong> ${dx.severity || 'N/A'}</div>
                            </div>
                            ${dx.fracture_type && dx.fracture_type !== 'Not applicable' ? `<div><strong>Fracture Type:</strong> ${dx.fracture_type}</div>` : ''}
                            ${dx.ligament_grade && dx.ligament_grade !== 'Not applicable' ? `<div><strong>Ligament Grade:</strong> ${dx.ligament_grade}</div>` : ''}
                        </div>
                        `).join('')}
                        
                        ${encounter.diagnoses.filter(d => d.diagnosis_type === 'suspected').length > 0 ? `
                        <div class="info-item">
                            <div class="info-label">Suspected Conditions</div>
                            <div class="info-value">${encounter.diagnoses.filter(d => d.diagnosis_type === 'suspected').map(dx => dx.diagnosis_name).join(', ')}</div>
                        </div>
                        ` : ''}
                        
                        ${encounter.diagnoses.filter(d => d.diagnosis_type === 'differential').length > 0 ? `
                        <div class="info-item">
                            <div class="info-label">Differential Diagnoses</div>
                            <div class="info-value">${encounter.diagnoses.filter(d => d.diagnosis_type === 'differential').map(dx => dx.diagnosis_name).join(', ')}</div>
                        </div>
                        ` : ''}
                    ` : '<div class="info-item"><div class="info-value">No diagnoses recorded</div></div>'}

                    <!-- SECTION 5: Management Plan -->
                    <h3 class="subsection-title">5. Management Plan</h3>
                    <div class="two-columns">
                        <div>
                            <div class="info-item">
                                <div class="info-label">Immobilization Type</div>
                                <div class="info-value">${management.immobilization_type || 'None'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Physiotherapy</div>
                                <div class="info-value">${renderYesNoBadge(management.physiotherapy)}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Pain Medications</div>
                                <div class="info-value">${management.pain_medications || 'None'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Activity Modification</div>
                                <div class="info-value">${management.activity_modification || 'None'}</div>
                            </div>
                        </div>
                        <div>
                            <div class="info-item">
                                <div class="info-label">Surgical Plan</div>
                                <div class="info-value">${management.surgical_plan || 'No surgical plan'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Fracture Fixation</div>
                                <div class="info-value">${management.fracture_fixation || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Arthroscopy</div>
                                <div class="info-value">${management.arthroscopy || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Joint Replacement</div>
                                <div class="info-value">${management.joint_replacement || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div class="info-item">
                        <div class="info-label">Post-operative Care Plan</div>
                        <div class="info-value">${management.post_op_care || 'N/A'}</div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Follow-up Timeline</div>
                            <div class="info-value">${management.follow_up_timeline || 'Not specified'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Repeat Imaging Schedule</div>
                            <div class="info-value">${management.repeat_imaging_schedule || 'Not specified'}</div>
                        </div>
                        <div class="info-item full-width">
                            <div class="info-label">Red Flag Symptoms</div>
                            <div class="info-value">${management.red_flag_symptoms || 'None specified'}</div>
                        </div>
                    </div>

                    ${rehabMilestones.length > 0 ? `
                    <div class="info-item">
                        <div class="info-label">Rehabilitation Milestones</div>
                        <div class="info-value">
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                ${rehabMilestones.map(m => `<li>${m.milestone_description}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : ''}

                    <!-- SECTION 6: Referrals -->
                    <h3 class="subsection-title">6. Referrals</h3>
                    <div class="three-columns">
                        <div class="info-item" style="text-align: center;">
                            <div class="info-label">Physical Therapy</div>
                            <div class="info-value">${renderYesNoBadge(referrals.pt_referral)}</div>
                        </div>
                        <div class="info-item" style="text-align: center;">
                            <div class="info-label">Pain Clinic</div>
                            <div class="info-value">${renderYesNoBadge(referrals.pain_clinic)}</div>
                        </div>
                        <div class="info-item" style="text-align: center;">
                            <div class="info-label">Surgery Consultation</div>
                            <div class="info-value">${renderYesNoBadge(referrals.surgery_referral)}</div>
                        </div>
                    </div>

                    <!-- SECTION 7: Physician Notes -->
                    <h3 class="subsection-title">7. Physician Notes</h3>
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <div class="info-label">Additional Observations</div>
                            <div class="info-value">${notes.additional_observations || 'N/A'}</div>
                        </div>
                        <div class="info-item full-width">
                            <div class="info-label">Counseling & Education Provided</div>
                            <div class="info-value">${notes.counseling || 'N/A'}</div>
                        </div>
                        <div class="info-item full-width">
                            <div class="info-label">Patient Questions & Concerns</div>
                            <div class="info-value">${notes.patient_questions || 'N/A'}</div>
                        </div>
                        <div class="info-item full-width">
                            <div class="info-label">Education Provided</div>
                            <div class="info-value">${notes.education_provided || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // Calculate summary statistics
    const totalEncounters = allEncounters.length;
    const primaryDiagnoses = [];
    const conditions = [];
    
    allEncounters.forEach(encounter => {
        if (encounter.diagnoses) {
            const primary = encounter.diagnoses.find(d => d.diagnosis_type === 'primary');
            if (primary && primary.diagnosis_name) {
                primaryDiagnoses.push(primary.diagnosis_name);
                if (primary.affected_joint) conditions.push(primary.affected_joint);
            }
        }
    });

    const getMostCommonDiagnosis = () => {
        if (primaryDiagnoses.length === 0) return 'N/A';
        const counts = {};
        primaryDiagnoses.forEach(dx => { counts[dx] = (counts[dx] || 0) + 1; });
        const maxCount = Math.max(...Object.values(counts));
        return Object.keys(counts).find(key => counts[key] === maxCount) || 'N/A';
    };

    const getMostCommonJoint = () => {
        if (conditions.length === 0) return 'N/A';
        const counts = {};
        conditions.forEach(cond => { counts[cond] = (counts[cond] || 0) + 1; });
        const maxCount = Math.max(...Object.values(counts));
        return Object.keys(counts).find(key => counts[key] === maxCount) || 'N/A';
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${isSingleEncounter ? 'Single Encounter' : 'Complete'} Orthopedic Report - ${patientData.patient_name}</title>
            ${styles}
            <script>
                function toggleEncounter(element) {
                    const body = element.nextElementSibling;
                    const button = element.querySelector('.toggle-button');
                    body.classList.toggle('show');
                    button.textContent = body.classList.contains('show') ? '▲ Collapse' : '▼ Expand';
                }
                
                function expandAll() {
                    document.querySelectorAll('.encounter-body').forEach(body => {
                        body.classList.add('show');
                    });
                    document.querySelectorAll('.toggle-button').forEach(btn => {
                        btn.textContent = '▲ Collapse';
                    });
                }
                
                function collapseAll() {
                    document.querySelectorAll('.encounter-body').forEach(body => {
                        body.classList.remove('show');
                    });
                    document.querySelectorAll('.toggle-button').forEach(btn => {
                        btn.textContent = '▼ Expand';
                    });
                }
            </script>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    <h1>${isSingleEncounter ? 'Single Encounter' : 'Complete'} Orthopedic Patient Report</h1>
                    ${isSingleEncounter ? '<p style="background: #ffc107; color: #333; display: inline-block; padding: 5px 15px; border-radius: 20px; margin-top: 10px;">Single Encounter Report </p>' : ''}
                    <h3>${patientData.patient_name}</h3>
                    <p>Patient ID: ${patientData.patient_id}</p>
                    <p>Date of Birth: ${formatDateOnly(patientData.dob)} | Age: ${patientData.age} years | Gender: ${patientData.gender}</p>
                    <p>Contact: ${patientData.contact_number || 'N/A'} | Email: ${patientData.email || 'N/A'}</p>
                    ${patientData.address ? `<p>Address: ${patientData.address}</p>` : ''}
                </div>

                <!-- Summary Statistics -->
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="number">${allEncounters.length}</div>
                        <div class="label">${isSingleEncounter ? 'Encounter' : 'Total Encounters'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${getMostCommonDiagnosis() !== 'N/A' ? '✓' : 'N/A'}</div>
                        <div class="label">Most Common Diagnosis</div>
                        <div style="font-size: 12px; margin-top: 5px;">${getMostCommonDiagnosis()}</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${getMostCommonJoint() !== 'N/A' ? '✓' : 'N/A'}</div>
                        <div class="label">Most Affected Joint</div>
                        <div style="font-size: 12px; margin-top: 5px;">${getMostCommonJoint()}</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${allEncounters.filter(e => e.management?.surgical_plan && e.management.surgical_plan !== 'No surgical plan').length}</div>
                        <div class="label">Surgical Interventions</div>
                    </div>
                </div>


                    <!-- Patient Medical History -->
                    <div class="section">
                        <h2 class="section-title">Patient Medical History</h2>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Blood Group</div>
                                <div class="info-value">${patientData.blood_group || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Allergies</div>
                                <div class="info-value">${patientData.allergies || 'None'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Occupation</div>
                                <div class="info-value">${patientData.occupation || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Physical Activity Level</div>
                                <div class="info-value">${patientData.physical_activity_level || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Smoking Status</div>
                                <div class="info-value">${patientData.smoking_status || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Alcohol Use</div>
                                <div class="info-value">${patientData.alcohol_use || 'N/A'}</div>
                            </div>
                        </div>

                        ${patientData.past_medical_history && patientData.past_medical_history !== 'N/A' ? `
                        <div class="info-item full-width">
                            <div class="info-label">Past Medical History</div>
                            <div class="info-value">${patientData.past_medical_history}</div>
                        </div>
                        ` : ''}

                        ${patientData.past_surgical_history && patientData.past_surgical_history !== 'N/A' ? `
                        <div class="info-item full-width">
                            <div class="info-label">Past Surgical History</div>
                            <div class="info-value">${patientData.past_surgical_history}</div>
                        </div>
                        ` : ''}

                        ${patientData.family_history && patientData.family_history !== 'N/A' ? `
                        <div class="info-item full-width">
                            <div class="info-label">Family History</div>
                            <div class="info-value">${patientData.family_history}</div>
                        </div>
                        ` : ''}

                        ${patientData.social_history && patientData.social_history !== 'N/A' ? `
                        <div class="info-item full-width">
                            <div class="info-label">Social History</div>
                            <div class="info-value">${patientData.social_history}</div>
                        </div>
                        ` : ''}

                        <!-- Emergency Contact Information -->
                        <h3 class="subsection-title">Emergency Contact</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Emergency Contact Name</div>
                                <div class="info-value">${patientData.emergency_name || 'Not provided'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Emergency Contact Number</div>
                                <div class="info-value">${patientData.emergency_contact_number || 'Not provided'}</div>
                            </div>
                        </div>

                        <!-- Physical Metrics -->
                        <h3 class="subsection-title">Physical Metrics</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Height</div>
                                <div class="info-value">${patientData.height_cm ? patientData.height_cm + ' cm' : 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Weight</div>
                                <div class="info-value">${patientData.weight_kg ? patientData.weight_kg + ' kg' : 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">BMI</div>
                                <div class="info-value">${patientData.bmi || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                <!-- All Encounters Section -->
                <div class="section">
                    <h2 class="section-title">All Medical Encounters (${totalEncounters})</h2>
                    
                    <div class="no-print" style="text-align: right; margin-bottom: 15px;">
                        <button onclick="expandAll()" style="padding: 8px 16px; margin-right: 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Expand All</button>
                        <button onclick="collapseAll()" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Collapse All</button>
                    </div>
                    
                    ${allEncounters.map(encounter => renderEncounterDetails(encounter)).join('')}
                    
                    ${allEncounters.length === 0 ? `
                    <div class="info-item" style="text-align: center; padding: 40px;">
                        <div class="info-value">No encounters found for this patient</div>
                    </div>
                    ` : ''}
                </div>

                <div class="footer">
                    <p>Report generated on ${new Date().toLocaleString()}</p>
                    <p>This report includes all medical encounters for this patient. Data is for medical purposes only.</p>
                    <p style="margin-top: 10px;">** This is a computer-generated document **</p>
                </div>
            </div>
            <div class="no-print" style="text-align: center; margin-top: 20px; padding: 20px;">
                <button onclick="window.print()" style="padding: 12px 24px; background: #2c7da0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin: 0 5px;">
                    🖨️ Print / Save as PDF
                </button>
                <button onclick="window.close()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin: 0 5px;">
                    ✖ Close
                </button>
            </div>
        </body>
        </html>
    `;

    reportWindow.document.write(html);
    reportWindow.document.close();
};