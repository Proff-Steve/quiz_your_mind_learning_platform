export interface PQOption {
  label: string;
  text: string;
}

export interface PQQuestion {
  id: number;
  section: string;
  number: number;
  text: string;
  options: PQOption[];
  correct: string;
}

const IM: PQQuestion[] = [
  {
    id: 1, section: "Internal Medicine", number: 1,
    text: "In aortic dissection, the involvement of the ascending aorta is classified and managed as?",
    options: [
      { label: "A", text: "Stanford I and managed surgically" },
      { label: "B", text: "Stanford A and managed surgically" },
      { label: "C", text: "Stanford A and managed medically" },
      { label: "D", text: "Stanford B and managed surgically" },
    ], correct: "B",
  },
  {
    id: 2, section: "Internal Medicine", number: 2,
    text: "The investigation of choice in a suspected aortic dissection is",
    options: [
      { label: "A", text: "Ultrasound scan of the chest" },
      { label: "B", text: "CT angiography" },
      { label: "C", text: "Conventional angiography" },
      { label: "D", text: "MR angiography" },
    ], correct: "B",
  },
  {
    id: 3, section: "Internal Medicine", number: 3,
    text: "A fifty-nine-year-old lawyer is referred to the General Internal Medicine outpatient clinic after an incidental finding of hypertension at a health screening event. His recorded Blood Pressure in clinic is 180/100mmHg. Second and third readings at the clinic are 170/90mmHg and 165/100mmHg. Which of the following is the MOST LIKELY cause of his hypertension if confirmed?",
    options: [
      { label: "A", text: "Phaeochromocytoma" },
      { label: "B", text: "Renal Artery Stenosis" },
      { label: "C", text: "Renal Disease" },
      { label: "D", text: "Essential hypertension" },
    ], correct: "D",
  },
  {
    id: 4, section: "Internal Medicine", number: 4,
    text: "The following statements regarding congenital heart diseases (CHD) are true EXCEPT:",
    options: [
      { label: "A", text: "Maternal Gestational Diabetes Mellitus is associated with CHD in infants" },
      { label: "B", text: "The cause of 85 to 90% of CHDs are unknown" },
      { label: "C", text: "CHDs are the leading cause of deaths in children with congenital malformations" },
      { label: "D", text: "Atrial Septal Defects are the most common CHDs in the paediatric population" },
    ], correct: "D",
  },
  {
    id: 5, section: "Internal Medicine", number: 5,
    text: "An 82 year old man who has a recent history of a stroke and has atrial fibrillation, presents with acute limb ischaemia that started 2 hours prior to presentation. He has no previous symptom of peripheral vascular disease. Which of these is the best treatment option?",
    options: [
      { label: "A", text: "Percutaneous thrombolysis" },
      { label: "B", text: "Thrombectomy" },
      { label: "C", text: "Surgical embolectomy" },
      { label: "D", text: "Bypass surgery" },
    ], correct: "C",
  },
  {
    id: 6, section: "Internal Medicine", number: 6,
    text: "A 90-year-old retired professor presents with a history of chest pain and exertional syncope. His ECG demonstrates left ventricular hypertrophy and an echocardiogram demonstrates a calcified aortic valve. What is his most likely diagnosis?",
    options: [
      { label: "A", text: "Aortic Stenosis" },
      { label: "B", text: "Mitral Stenosis" },
      { label: "C", text: "Aortic Regurgitation" },
      { label: "D", text: "Mitral regurgitation" },
    ], correct: "A",
  },
  {
    id: 7, section: "Internal Medicine", number: 7,
    text: "A 30-year-old doctor being treated for a severe bout of PCR-positive COVID-19 infection develops persistent chest pain, palpitations, dizziness and two episodes of syncope. He had no prior cardiovascular risk factors. An ECG shows Sinus tachycardia with diffuse T wave inversions and cardiac troponin I is well elevated at 2ng/mL. After a bout of severe chest pain, an ECG reveals ventricular tachycardia. His BP is 90/70 mmHg. What is the MOST APPROPRIATE next step in his management?",
    options: [
      { label: "A", text: "IV Atropine" },
      { label: "B", text: "IV amiodarone" },
      { label: "C", text: "Electrical Cardioversion" },
      { label: "D", text: "IV aminophylline" },
    ], correct: "C",
  },
  {
    id: 8, section: "Internal Medicine", number: 8,
    text: "A fifty-five-year-old banker has been treated with amlodipine 10mg for the last year. His home BP measurements have ranged between 140/90mmHg and 148/95mmHg. Which of the following abnormalities are likely to be seen on his echocardiogram?",
    options: [
      { label: "A", text: "Left ventricular hypertrophy" },
      { label: "B", text: "Regional wall motion abnormalities" },
      { label: "C", text: "Diastolic Dysfunction" },
      { label: "D", text: "LV thrombus" },
    ], correct: "A",
  },
  {
    id: 9, section: "Internal Medicine", number: 9,
    text: "A 52-year-old man who is a known hypertensive and diabetic was rushed to the emergency room with acute chest pain and breathlessness. ECG shows lateral infarct of the myocardium. All the following may follow this man's condition EXCEPT:",
    options: [
      { label: "A", text: "Elevated temperature" },
      { label: "B", text: "Neutropenia" },
      { label: "C", text: "Elevated sedimentation rate" },
      { label: "D", text: "Elevated venous pressure" },
    ], correct: "B",
  },
  {
    id: 10, section: "Internal Medicine", number: 10,
    text: "The following may cause cardiomegaly on chest radiography except",
    options: [
      { label: "A", text: "Pulmonary hypertension" },
      { label: "B", text: "Pericardial effusion" },
      { label: "C", text: "Tetralogy of Fallot" },
      { label: "D", text: "Dilated cardiomyopathy" },
    ], correct: "C",
  },
  {
    id: 11, section: "Internal Medicine", number: 11,
    text: "A study of ischemic heart disease analyses cases hospitalized with acute chest pain in which myocardial infarction was documented at autopsy. Haemorrhage and contraction bands in necrotic myocardial fibres are most likely to be seen with infarction in which of the following settings?",
    options: [
      { label: "A", text: "Acute vasculitis" },
      { label: "B", text: "Angioplasty with stent" },
      { label: "C", text: "Septic embolization" },
      { label: "D", text: "Coronary thrombosis" },
    ], correct: "B",
  },
  {
    id: 12, section: "Internal Medicine", number: 12,
    text: "Tricuspid valve regurgitation may cause all of the following except",
    options: [
      { label: "A", text: "Dilated superior vena cava" },
      { label: "B", text: "Right atrial dilatation" },
      { label: "C", text: "Left atrial dilatation" },
      { label: "D", text: "Dilated IVC" },
    ], correct: "C",
  },
  {
    id: 13, section: "Internal Medicine", number: 13,
    text: "A 60-year-old hypertensive diabetic is seen in the A&E with bilateral feet swelling. BP is 120/60mmHg, pulse 90bpm, oxygen saturations 88% on air. Clinical examination reveals widespread crepitations in his chest and pitting oedema to his thighs. Echocardiogram reveals a left ventricle ejection fraction of 40%. At his review 12 months after discharge, his ejection fraction is now less than 30% and his ECG shows left bundle branch block. Which device combination is likely to benefit him?",
    options: [
      { label: "A", text: "ICD" },
      { label: "B", text: "Cardiac resynchronization therapy" },
      { label: "C", text: "Pacemaker" },
      { label: "D", text: "Cardiac resynchronization therapy and ICD" },
    ], correct: "D",
  },
  {
    id: 14, section: "Internal Medicine", number: 14,
    text: "A fifty-five-year-old banker has been treated with amlodipine 10mg for the last year. His home BP measurements have ranged between 140/90mmHg and 148/95mmHg. Which of the following investigations will you be least interested in requesting?",
    options: [
      { label: "A", text: "Resting ECG" },
      { label: "B", text: "None of the above" },
      { label: "C", text: "24 Hour Holter BP" },
      { label: "D", text: "Stress ECG" },
    ], correct: "D",
  },
  {
    id: 15, section: "Internal Medicine", number: 15,
    text: "A 60-year-old hypertensive and diabetic is brought into the emergency room with chest pain of one hour's duration and new onset confusion. He has a blood pressure of 100/60mmHg and oxygen saturations of 92% on air. His ECG shows new left bundle branch block and blood tests reveal significantly elevated CK-MB and Troponin T. His blood sugar is 12mmol/L. Which of the following medications will be least beneficial to him long term?",
    options: [
      { label: "A", text: "Aspirin" },
      { label: "B", text: "ACE inhibitors" },
      { label: "C", text: "Beta Blockers" },
      { label: "D", text: "Amlodipine" },
    ], correct: "D",
  },
  {
    id: 16, section: "Internal Medicine", number: 16,
    text: "A 90-year-old retired professor presents with a history of chest pain and exertional syncope. His ECG demonstrates left ventricular hypertrophy and an echocardiogram demonstrates a calcified aortic valve. Which of the following investigations will confirm his diagnosis?",
    options: [
      { label: "A", text: "Holter ECG" },
      { label: "B", text: "Stress ECG" },
      { label: "C", text: "Echocardiogram" },
      { label: "D", text: "Coronary Angiogram" },
    ], correct: "C",
  },
  {
    id: 17, section: "Internal Medicine", number: 17,
    text: "A 44-year-old woman presented with type II hypersensitivity reaction and widespread vasculitis severely affecting the pulmonary vasculature. The patient started responding to the initial dose of cytotoxic drugs. Which of the following is the most likely diagnosis?",
    options: [
      { label: "A", text: "Churg-Strauss syndrome" },
      { label: "B", text: "Henoch-Schonlein purpura" },
      { label: "C", text: "Goodpasture's syndrome" },
      { label: "D", text: "Takayasu disease" },
    ], correct: "C",
  },
  {
    id: 18, section: "Internal Medicine", number: 18,
    text: "A 22-year-old medical student is brought into the emergency room with palpitations, chest discomfort and shortness of breath. Her ECG shows a narrow complex tachycardia with a rate of 180bpm. A previous ECG in her file shows normal sinus rhythm with a short PR interval and a delta wave. What is her most likely diagnosis?",
    options: [
      { label: "A", text: "Atrial flutter" },
      { label: "B", text: "Wolf Parkinson White Syndrome" },
      { label: "C", text: "Atrial Fibrillation" },
      { label: "D", text: "Ventricular Tachycardia" },
    ], correct: "B",
  },
  {
    id: 19, section: "Internal Medicine", number: 19,
    text: "A 52-year-old man who is a known hypertensive for 10 years with poor control of his hypertension presented with tearing chest pain. CT scan shows aortic aneurysm. Which part of the aorta is most likely to be affected by the aneurysm?",
    options: [
      { label: "A", text: "Descending aorta" },
      { label: "B", text: "Arch of aorta" },
      { label: "C", text: "Ascending aorta" },
      { label: "D", text: "Abdominal aorta" },
    ], correct: "D",
  },
  {
    id: 20, section: "Internal Medicine", number: 20,
    text: "A 40-year-old footballer collapses during a competitive match and recovers after CPR on the field of play. A subsequent history reveals that his father had died suddenly and without a known cause at the age of 35. He has been well until this event. Which of the following investigations will be most helpful initially?",
    options: [
      { label: "A", text: "ECG" },
      { label: "B", text: "Echocardiogram" },
      { label: "C", text: "Holter monitoring" },
      { label: "D", text: "Stress ECG" },
    ], correct: "A",
  },
  {
    id: 21, section: "Internal Medicine", number: 21,
    text: "Hypertensive urgency may be used to describe the clinical scenario in which:",
    options: [
      { label: "A", text: "BP elevation is greater than 160mmHg but less than 180mmHg systolic" },
      { label: "B", text: "BP is elevated above 160mmHg (usually >180/120) but without target organ damage" },
      { label: "C", text: "BP is elevated above 160mmHg but with target organ damage" },
      { label: "D", text: "BP elevation is only transient" },
    ], correct: "B",
  },
  {
    id: 22, section: "Internal Medicine", number: 22,
    text: "A 22-year-old medical student is brought into the emergency room with palpitations, chest discomfort and shortness of breath. Her ECG shows a narrow complex tachycardia. A previous ECG shows normal sinus rhythm with a short PR interval and a delta wave. Which of the following will be the first-line treatment acutely?",
    options: [
      { label: "A", text: "Adenosine" },
      { label: "B", text: "Verapamil" },
      { label: "C", text: "Amiodarone" },
      { label: "D", text: "Metoprolol" },
    ], correct: "A",
  },
  {
    id: 23, section: "Internal Medicine", number: 23,
    text: "Which of the following drugs have been shown to reduce repeated hospitalisations in heart failure patients?",
    options: [
      { label: "A", text: "Hydralazine" },
      { label: "B", text: "Indapamide" },
      { label: "C", text: "Digoxin" },
      { label: "D", text: "Spironolactone" },
    ], correct: "C",
  },
  {
    id: 24, section: "Internal Medicine", number: 24,
    text: "A 50-year-old banker is rushed to the emergency room with shortness of breath, chest discomfort and a Blood Pressure of 192/110mmHg. Repeated measurements confirm hypertensive emergency. Which of the following medications is not considered first line treatment in this situation?",
    options: [
      { label: "A", text: "Spironolactone" },
      { label: "B", text: "Labetalol" },
      { label: "C", text: "Sodium Nitroprusside" },
      { label: "D", text: "Hydralazine" },
    ], correct: "A",
  },
  {
    id: 25, section: "Internal Medicine", number: 25,
    text: "Which of the following is the gold-standard for diagnosing hypertension?",
    options: [
      { label: "A", text: "Home BP recordings" },
      { label: "B", text: "24 Hour BP measurements (Ambulatory)" },
      { label: "C", text: "Visit to visit variation in Blood Pressure" },
      { label: "D", text: "Clinic BP measurements" },
    ], correct: "B",
  },
  {
    id: 26, section: "Internal Medicine", number: 26,
    text: "A 23-year-old man presented with symptoms and signs of bacterial endocarditis. Which of the following statements is true regarding endocarditis?",
    options: [
      { label: "A", text: "The vegetations are small and firm, involving the entire margin of the valve leaflet" },
      { label: "B", text: "It never occurs on normal valves" },
      { label: "C", text: "Septic emboli from them may result in infarcts and abscesses in the kidney, spleen, and brain" },
      { label: "D", text: "Prosthetic heart valves do not develop endocarditis because organisms will not grow on plastics or metal" },
    ], correct: "C",
  },
  {
    id: 27, section: "Internal Medicine", number: 27,
    text: "A 40-year-old footballer collapses during a competitive match and recovers after CPR on the field of play. His father died suddenly at the age of 35. Which of the following is the most probable diagnosis?",
    options: [
      { label: "A", text: "Cardiac Sarcoid" },
      { label: "B", text: "Hypertrophic Cardiomyopathy" },
      { label: "C", text: "Cardiac Amyloid" },
      { label: "D", text: "Hypertensive heart disease" },
    ], correct: "B",
  },
  {
    id: 28, section: "Internal Medicine", number: 28,
    text: "A 40-year-old footballer collapses during a competitive match and recovers after CPR. His father died suddenly at age 35. Which of the following can help establish the most likely diagnosis?",
    options: [
      { label: "A", text: "Holter ECG" },
      { label: "B", text: "Thallium Scan" },
      { label: "C", text: "Cardiac MRI" },
      { label: "D", text: "Cardiac CT" },
    ], correct: "C",
  },
  {
    id: 29, section: "Internal Medicine", number: 29,
    text: "A 60-year-old hypertensive and diabetic is brought into the emergency room with chest pain of one hour's duration and new onset confusion. His ECG shows new left bundle branch block and blood tests reveal significantly elevated CK-MB and Troponin T. Which of the following represents the gold standard of treatment?",
    options: [
      { label: "A", text: "Observation" },
      { label: "B", text: "Treatment with aspirin, clopidogrel and clexane" },
      { label: "C", text: "Primary PCI" },
      { label: "D", text: "PCI after 48 hours" },
    ], correct: "C",
  },
  {
    id: 30, section: "Internal Medicine", number: 30,
    text: "A 30-year-old doctor being treated for PCR-positive COVID-19 develops persistent chest pain, palpitations and syncope. An ECG shows Sinus tachycardia with diffuse T wave inversions and elevated cardiac troponin I at 2ng/mL. Why might a D-Dimer test be UNHELPFUL in this patient?",
    options: [
      { label: "A", text: "Because of concomitant infection (COVID elevates D-dimer)" },
      { label: "B", text: "Because of its low specificity" },
      { label: "C", text: "Because of its high sensitivity" },
      { label: "D", text: "Because a PE is unlikely" },
    ], correct: "A",
  },
  {
    id: 31, section: "Internal Medicine", number: 31,
    text: "A 30-year-old doctor being treated for COVID-19 develops persistent chest pain, palpitations and syncope. An ECG shows Sinus tachycardia with diffuse T wave inversions and elevated troponin I. Which of the following diagnoses is the LEAST LIKELY?",
    options: [
      { label: "A", text: "COVID-19 Myocarditis" },
      { label: "B", text: "COVID-19 Pericarditis" },
      { label: "C", text: "Pulmonary Embolus" },
      { label: "D", text: "Myocardial Infarction" },
    ], correct: "D",
  },
  {
    id: 32, section: "Internal Medicine", number: 32,
    text: "A 30-year-old doctor being treated for COVID-19 develops persistent chest pain, palpitations and syncope. An ECG shows Sinus tachycardia with diffuse T wave inversions, and cardiac troponin I is elevated. Which of the following is the least likely cause of hypertension if confirmed in this patient?",
    options: [
      { label: "A", text: "Renal Disease" },
      { label: "B", text: "Renal Artery Stenosis" },
      { label: "C", text: "Phaeochromocytoma" },
      { label: "D", text: "Essential hypertension" },
    ], correct: "D",
  },
  {
    id: 33, section: "Internal Medicine", number: 33,
    text: "A fifty-five-year-old banker has been treated with amlodipine 10mg for the last year. His home BP measurements have ranged between 140/90mmHg and 148/95mmHg. Which of the following medications will you add on to his treatment?",
    options: [
      { label: "A", text: "Bisoprolol" },
      { label: "B", text: "Hydralazine" },
      { label: "C", text: "Doxazosin" },
      { label: "D", text: "Indapamide" },
    ], correct: "D",
  },
  {
    id: 34, section: "Internal Medicine", number: 34,
    text: "A 60-year-old hypertensive diabetic is seen in the A&E with bilateral feet swelling. His BP is 120/60mmHg, pulse 90bpm, oxygen saturations 88% on air. Echocardiogram reveals a left ventricle ejection fraction of 40%. Which of the following medications is least likely to improve the patient's survival long term?",
    options: [
      { label: "A", text: "Lisinopril" },
      { label: "B", text: "Carvedilol" },
      { label: "C", text: "Spironolactone" },
      { label: "D", text: "Amlodipine" },
    ], correct: "D",
  },
  {
    id: 35, section: "Internal Medicine", number: 35,
    text: "At what target BP must oral medications be considered?",
    options: [
      { label: "A", text: "180mmHg systolic" },
      { label: "B", text: "120mmHg systolic" },
      { label: "C", text: "140mmHg systolic" },
      { label: "D", text: "160mmHg systolic" },
    ], correct: "D",
  },
  {
    id: 36, section: "Internal Medicine", number: 36,
    text: "A forty-year-old lady presents with a two-day history of palpitations with chest discomfort. She admits to fever and a productive cough in the last week. Her blood pressure is 100/60mmHg on admission with oxygen saturations 90% on room air. Her clinical examination reveals coarse crepitations in her left lower lung zones. What is her most likely cardiac diagnosis?",
    options: [
      { label: "A", text: "Atrial fibrillation" },
      { label: "B", text: "AVRT" },
      { label: "C", text: "Sick sinus syndrome" },
      { label: "D", text: "AVNRT" },
    ], correct: "A",
  },
  {
    id: 37, section: "Internal Medicine", number: 37,
    text: "A 36-year-old woman with high levels of LDL has developed an outpouching of the aorta. Which part of the aorta is most likely affected?",
    options: [
      { label: "A", text: "Ascending aorta" },
      { label: "B", text: "Abdominal aorta" },
      { label: "C", text: "Descending aorta" },
      { label: "D", text: "Arch of aorta" },
    ], correct: "B",
  },
  {
    id: 38, section: "Internal Medicine", number: 38,
    text: "A 60-year-old hypertensive and diabetic is brought into the emergency room with chest pain of one hour's duration and new onset confusion. His ECG shows new left bundle branch block and blood tests reveal significantly elevated CK-MB and Troponin T. Which of the following is his most likely diagnosis?",
    options: [
      { label: "A", text: "Myocarditis" },
      { label: "B", text: "Urinary tract infection" },
      { label: "C", text: "Acute myocardial infarction" },
      { label: "D", text: "Alzheimer's Disease" },
    ], correct: "C",
  },
  {
    id: 39, section: "Internal Medicine", number: 39,
    text: "A 22-year-old footballer with no pre-existing conditions presents with severe positional chest pain of three hours duration. His ECG shows widespread saddle-shaped ST elevation. He is haemodynamically stable with BP of 130/88mmHg. Which of the following is his most likely diagnosis?",
    options: [
      { label: "A", text: "Oesophagitis" },
      { label: "B", text: "Myocarditis" },
      { label: "C", text: "Pericarditis" },
      { label: "D", text: "Myocardial Infarction" },
    ], correct: "C",
  },
  {
    id: 40, section: "Internal Medicine", number: 40,
    text: "A 22-year-old footballer with no pre-existing conditions presents with severe positional chest pain of three hours duration. His ECG shows widespread saddle-shaped ST elevation. He is haemodynamically stable. Which of the following medications will be helpful to him?",
    options: [
      { label: "A", text: "Clexane" },
      { label: "B", text: "Clopidogrel" },
      { label: "C", text: "Isosorbide Dinitrate" },
      { label: "D", text: "Ibuprofen" },
    ], correct: "D",
  },
  {
    id: 41, section: "Internal Medicine", number: 41,
    text: "A 22-year-old medical student is brought into the emergency room with palpitations, chest discomfort and shortness of breath. Her ECG shows a narrow complex tachycardia. A previous ECG shows normal sinus rhythm with a short PR interval and a delta wave. She has four more episodes in the 6 months following discharge. Which of the following will represent definitive treatment?",
    options: [
      { label: "A", text: "Verapamil" },
      { label: "B", text: "Xarelto" },
      { label: "C", text: "None of the other options" },
      { label: "D", text: "Radiofrequency ablation" },
    ], correct: "D",
  },
  {
    id: 42, section: "Internal Medicine", number: 42,
    text: "A 57-year-old man with a history of atrial fibrillation is diagnosed with classic angina. Which of the following medications would be contraindicated in this patient?",
    options: [
      { label: "A", text: "Diltiazem" },
      { label: "B", text: "Metoprolol" },
      { label: "C", text: "Nifedipine" },
      { label: "D", text: "Verapamil" },
    ], correct: "C",
  },
  {
    id: 43, section: "Internal Medicine", number: 43,
    text: "A 65-year-old male experiences uncontrolled angina attacks despite being on a maximised dose of a beta-blocker. What should be added to his regimen?",
    options: [
      { label: "A", text: "Amlodipine" },
      { label: "B", text: "Aspirin" },
      { label: "C", text: "Ranolazine" },
      { label: "D", text: "Verapamil" },
    ], correct: "A",
  },
  {
    id: 44, section: "Internal Medicine", number: 44,
    text: "A patient presents with acute chest pain suggestive of angina. Which medication should be prescribed for rapid relief of symptoms?",
    options: [
      { label: "A", text: "Metoprolol" },
      { label: "B", text: "Nitroglycerin patch" },
      { label: "C", text: "Sublingual nitroglycerin" },
      { label: "D", text: "IV Isosorbide mononitrate" },
    ], correct: "C",
  },
  {
    id: 45, section: "Internal Medicine", number: 45,
    text: "A patient is diagnosed with heart failure with reduced ejection fraction. Which medication is considered a first-line treatment for this condition?",
    options: [
      { label: "A", text: "Digoxin" },
      { label: "B", text: "Furosemide" },
      { label: "C", text: "Lisinopril" },
      { label: "D", text: "Metoprolol" },
    ], correct: "C",
  },
  {
    id: 46, section: "Internal Medicine", number: 46,
    text: "A 50-year-old banker is rushed to the emergency room with shortness of breath, chest discomfort and a Blood Pressure of 192/110mmHg. A diagnosis of Hypertensive Emergency is suspected. Which of the following will be considered an unusual clinical feature?",
    options: [
      { label: "A", text: "Bilateral leg swelling" },
      { label: "B", text: "Reduced visual acuity" },
      { label: "C", text: "Reduced urine output" },
      { label: "D", text: "Jaundice" },
    ], correct: "D",
  },
  {
    id: 47, section: "Internal Medicine", number: 47,
    text: "Which of the following is diagnostic of pulmonary embolism?",
    options: [
      { label: "A", text: "Dilated right ventricle on echocardiography" },
      { label: "B", text: "Dilated pulmonary artery on chest ultrasound scan" },
      { label: "C", text: "Filling defect on CT pulmonary angiography" },
      { label: "D", text: "Dilated IVC on contrast enhanced CT scan" },
    ], correct: "C",
  },
  {
    id: 48, section: "Internal Medicine", number: 48,
    text: "A 49-year-old, previously healthy woman reports having suddenly lost consciousness four times in the past 6 months. After the fourth episode, she was unconscious for 6 hours and had weakness in her left arm and difficulty speaking. On physical examination she is afebrile, blood pressure is normal, carotid pulses are good with no bruits. Which of the following cardiac lesions is most likely to be present?",
    options: [
      { label: "A", text: "Bicuspid aortic valve" },
      { label: "B", text: "Mitral valve stenosis" },
      { label: "C", text: "Left atrial myxoma" },
      { label: "D", text: "Pericardial effusion" },
    ], correct: "C",
  },
  {
    id: 49, section: "Internal Medicine", number: 49,
    text: "A 50-year-old banker is rushed to the emergency room with shortness of breath, chest discomfort and a Blood Pressure of 192/110mmHg. A diagnosis of Hypertensive Emergency is suspected. ALL of the following investigations EXCEPT one must be done to confirm the suspicion. Which investigation should NOT be done?",
    options: [
      { label: "A", text: "ECG" },
      { label: "B", text: "Urine RE" },
      { label: "C", text: "Echocardiogram" },
      { label: "D", text: "Stress ECG" },
    ], correct: "D",
  },
  {
    id: 50, section: "Internal Medicine", number: 50,
    text: "A 50-year-old man who has been using a prosthetic heart valve for the past 8 years due to rheumatic heart disease complicated by aortic stenosis is now presenting with reduced exercise tolerance. Which of the following is the likely complication?",
    options: [
      { label: "A", text: "Paravalvular leaks" },
      { label: "B", text: "Embolization" },
      { label: "C", text: "Stenosis (Pannus formation/Thrombus)" },
      { label: "D", text: "Haemolysis" },
    ], correct: "A",
  },
  {
    id: 51, section: "Internal Medicine", number: 51,
    text: "Which of the following imaging modalities WILL CONFIRM a diagnosis of myocarditis?",
    options: [
      { label: "A", text: "Invasive Coronary Angiography" },
      { label: "B", text: "Cardiac MRI" },
      { label: "C", text: "CT Angiography" },
      { label: "D", text: "Echocardiography" },
    ], correct: "B",
  },
  {
    id: 52, section: "Internal Medicine", number: 52,
    text: "Which of the following medications is least likely to be of benefit acutely in a 60-year-old hypertensive diabetic with acute left ventricular heart failure?",
    options: [
      { label: "A", text: "Frusemide" },
      { label: "B", text: "Warfarin" },
      { label: "C", text: "Nitrates" },
      { label: "D", text: "Diamorphine" },
    ], correct: "B",
  },
  {
    id: 53, section: "Internal Medicine", number: 53,
    text: "A 40-year-old footballer collapses during a competitive match and recovers after CPR. His father died suddenly at age 35. Recognised treatments for his most likely condition may include all the following except:",
    options: [
      { label: "A", text: "Internal Cardiac Defibrillators" },
      { label: "B", text: "Beta blockers" },
      { label: "C", text: "ACE inhibitors" },
      { label: "D", text: "Calcium channel blockers" },
    ], correct: "D",
  },
  {
    id: 54, section: "Internal Medicine", number: 54,
    text: "Which of the following tests will confirm renal artery stenosis as a cause of hypertension?",
    options: [
      { label: "A", text: "Abdominal ultrasound" },
      { label: "B", text: "Magnetic Resonance Angiogram" },
      { label: "C", text: "Creatinine" },
      { label: "D", text: "ACE inhibitor challenge" },
    ], correct: "B",
  },
  {
    id: 55, section: "Internal Medicine", number: 55,
    text: "In cardiovascular risk assessment, which of the following represents the LEAST invasive means to ascertain the extent to which an individual is overweight or obese?",
    options: [
      { label: "A", text: "BMI" },
      { label: "B", text: "Fasting lipid profile" },
      { label: "C", text: "Assessment of adiponectin" },
      { label: "D", text: "Glucose tolerance test to measure insulin sensitivity" },
    ], correct: "A",
  },
  {
    id: 56, section: "Internal Medicine", number: 56,
    text: "A 45-year-old diabetic hypertensive presented with sudden substernal chest pain radiating to the root of the neck associated with hypotension, hyperventilation and tachycardia. Coronary angiography shows about 70% occlusion of branches of the left coronary artery. Which of the following complications is likely to occur in this patient in the next one hour?",
    options: [
      { label: "A", text: "Ventricular fibrillation" },
      { label: "B", text: "Pericarditis" },
      { label: "C", text: "Myocardial fibrosis" },
      { label: "D", text: "Mural thrombosis" },
    ], correct: "A",
  },
  {
    id: 57, section: "Internal Medicine", number: 57,
    text: "A forty-year-old lady presents with a two-day history of palpitations with chest discomfort. She admits to fever and a productive cough in the last week. Her blood pressure is 100/60mmHg on admission with oxygen saturations 90% on room air. Clinical examination reveals coarse crepitations in her left lower lung zones. What is the MOST LIKELY underlying cause for the ECG finding in this patient?",
    options: [
      { label: "A", text: "Pneumonia" },
      { label: "B", text: "Myocardial Infarction" },
      { label: "C", text: "Electrolyte imbalance" },
      { label: "D", text: "Hypotension" },
    ], correct: "A",
  },
  {
    id: 58, section: "Internal Medicine", number: 58,
    text: "A forty-year-old lady presents with a two-day history of palpitations with chest discomfort. She has a fever and productive cough. Her BP is 100/60mmHg, O2 sats 90% on room air, and has crepitations in her left lower lung zones. Which of the following will you consider UNHELPFUL in this situation?",
    options: [
      { label: "A", text: "Holter ECG" },
      { label: "B", text: "Chest X Ray" },
      { label: "C", text: "Cardiac Enzymes" },
      { label: "D", text: "Full Blood Count" },
    ], correct: "A",
  },
  {
    id: 59, section: "Internal Medicine", number: 59,
    text: "A forty-year-old lady presents with a two-day history of palpitations with chest discomfort. She has a fever and productive cough. Her BP is 100/60mmHg, O2 sats 90% on room air, with crepitations in her left lower lung zones. Which of these FOUR treatments will LEAST benefit this patient?",
    options: [
      { label: "A", text: "Antibiotic with specificity to streptococcus" },
      { label: "B", text: "Calcium channel blockade with amlodipine" },
      { label: "C", text: "Beta blockade with bisoprolol" },
      { label: "D", text: "Anticoagulation with a NOAC" },
    ], correct: "B",
  },
  {
    id: 60, section: "Internal Medicine", number: 60,
    text: "A 21-year-old man suffered an acute chest pain with breathlessness. ECG shows left ventricular infarct and coronary angiography showing severe coronary artery atherosclerosis. Which of the following is the most likely contributing factor to his condition?",
    options: [
      { label: "A", text: "High LDL" },
      { label: "B", text: "Metabolic syndrome" },
      { label: "C", text: "Low HDL" },
      { label: "D", text: "Hyperhomocysteinaemia" },
    ], correct: "D",
  },
  {
    id: 61, section: "Internal Medicine", number: 61,
    text: "A 65-year-old man with a 25-year history of post rheumatic mitral stenosis presents with symptoms of heart failure. All the following are typical of longstanding pure mitral stenosis except:",
    options: [
      { label: "A", text: "Thrombosis in left atrium" },
      { label: "B", text: "Pulmonary venous hypertension" },
      { label: "C", text: "Dilatation and hypertrophy of the left atrium" },
      { label: "D", text: "Dilatation and hypertrophy of the left ventricle" },
    ], correct: "D",
  },
  {
    id: 62, section: "Internal Medicine", number: 62,
    text: "A forty-year-old lady presents with palpitations and chest discomfort after fever and productive cough. What is the commonest complication of her cardiac condition?",
    options: [
      { label: "A", text: "Ventricular Fibrillation" },
      { label: "B", text: "Cerebrovascular Accident" },
      { label: "C", text: "Myocardial Infarction" },
      { label: "D", text: "Left Ventricular Hypertrophy" },
    ], correct: "B",
  },
  {
    id: 63, section: "Internal Medicine", number: 63,
    text: "A 60-year-old man with a 20-year history of Diabetes Mellitus and 12 years of hypertension was brought to the clinic with severe pain in the toes of his right foot. The foot felt cold and the dorsalis pedis pulse was absent. Which of the following treatments is the initial management?",
    options: [
      { label: "A", text: "Admit to the ward, start fluid resuscitation, elevate head-end of bed, start analgesia and full dose low molecular weight heparin" },
      { label: "B", text: "Treat conservatively on outpatient basis using antiplatelet and warfarin and review in a week" },
      { label: "C", text: "Admit to the ward and start urgent intravenous thrombolytics and antiplatelet" },
      { label: "D", text: "Admit to ward, strict bedrest, elevate the foot, start IV ringers lactate and low molecular weight heparin" },
    ], correct: "A",
  },
];

const PHARM: PQQuestion[] = [
  {
    id: 64, section: "Pharmacology", number: 1,
    text: "Which of the following characteristics CANNOT be attributed to hydralazine?",
    options: [
      { label: "A", text: "Acts on cardiac preload rather than afterload" },
      { label: "B", text: "Alters intracellular Ca2+ and increases NO in arterioles" },
      { label: "C", text: "Is indicated in severe hypotension with pregnancy" },
      { label: "D", text: "May produce systemic lupus syndrome" },
    ], correct: "A",
  },
  {
    id: 65, section: "Pharmacology", number: 2,
    text: "Digoxin exerts its effects upon myocardial muscle at a cellular level by:",
    options: [
      { label: "A", text: "Increasing intracellular calcium" },
      { label: "B", text: "Inhibition of Na+/K+/ATPase at the cell membrane" },
      { label: "C", text: "Acting as a secondary messenger for G proteins" },
      { label: "D", text: "Acting directly upon actin and myosin filaments to promote contractility" },
    ], correct: "A",
  },
  {
    id: 66, section: "Pharmacology", number: 3,
    text: "Regarding antihypertensive medication, which statement is CORRECT?",
    options: [
      { label: "A", text: "Thiazide diuretics are the drugs of choice in cases of moderate to severe hypertension" },
      { label: "B", text: "Losartan inhibits synthesis of angiotensin II" },
      { label: "C", text: "Clonidine causes a brief rise in blood pressure followed by prolonged hypotension" },
      { label: "D", text: "Propranolol does not prevent reflex tachycardia" },
    ], correct: "C",
  },
  {
    id: 67, section: "Pharmacology", number: 4,
    text: "Methyldopa is a centrally acting antihypertensive agent. It is converted to ………, which acts on ………, in the brain and causes inhibition of adrenergic discharge to cause a fall in BP.",
    options: [
      { label: "A", text: "Methyladrenaline, alpha-2 receptors" },
      { label: "B", text: "Methyldopamine, beta-2 receptors" },
      { label: "C", text: "Methylnoradrenaline, alpha-2-receptors" },
      { label: "D", text: "Methyltyrosine, beta-2-receptor" },
    ], correct: "C",
  },
  {
    id: 68, section: "Pharmacology", number: 5,
    text: "All of the following anti-hypertensives act directly on vascular smooth muscle EXCEPT:",
    options: [
      { label: "A", text: "Felodipine" },
      { label: "B", text: "Nitroprusside" },
      { label: "C", text: "Indapamide" },
      { label: "D", text: "Prazosin" },
    ], correct: "D",
  },
  {
    id: 69, section: "Pharmacology", number: 6,
    text: "Losartan differs from enalapril in:",
    options: [
      { label: "A", text: "Its selective action on angiotensin type 1 receptors" },
      { label: "B", text: "Its enhanced effect on bradykinin metabolism" },
      { label: "C", text: "Its higher incidence of drug related angioedema" },
      { label: "D", text: "Its increased incidence of cough" },
    ], correct: "A",
  },
  {
    id: 70, section: "Pharmacology", number: 7,
    text: "Beneficial effects of nitrates in treatment of angina include all of the following EXCEPT:",
    options: [
      { label: "A", text: "Decreased ventricular volume" },
      { label: "B", text: "Decreased arterial pressure" },
      { label: "C", text: "Increased collateral flow" },
      { label: "D", text: "Reflex increase in contractility" },
    ], correct: "D",
  },
  {
    id: 71, section: "Pharmacology", number: 8,
    text: "An unknown patient presented to the ER unconscious with hypokalemia and hypomagnesemia while the ECG suggests a heart failing. Which of the following drugs is contraindicated in this case?",
    options: [
      { label: "A", text: "Digoxin" },
      { label: "B", text: "Spironolactone" },
      { label: "C", text: "Isosorbide dinitrate" },
      { label: "D", text: "Ramipril" },
    ], correct: "A",
  },
  {
    id: 72, section: "Pharmacology", number: 9,
    text: "Mechanism by which vasodilators improve myocardial performance in congestive heart failure:",
    options: [
      { label: "A", text: "Increase heart rate" },
      { label: "B", text: "Promote diuretics" },
      { label: "C", text: "Reduce afterload" },
      { label: "D", text: "Reduce pulmonary blood flow" },
    ], correct: "C",
  },
  {
    id: 73, section: "Pharmacology", number: 10,
    text: "This drug group useful in angina decreases myocardial oxygen requirement by decreasing the determinants of oxygen demand and does not increase myocardial oxygen delivery by reversing coronary arterial spasm:",
    options: [
      { label: "A", text: "Nitrates and nitrite drugs (Nitroglycerin, Isosorbide dinitrate)" },
      { label: "B", text: "Myotropic coronary dilators (Dipyridamole)" },
      { label: "C", text: "Potassium channel openers (Minoxidil)" },
      { label: "D", text: "Beta-adrenoceptor-blocking drugs (Atenolol, Metoprolol)" },
    ], correct: "D",
  },
  {
    id: 74, section: "Pharmacology", number: 11,
    text: "Which of the following is selective for arteriolar dilation only?",
    options: [
      { label: "A", text: "Glyceryl trinitrate" },
      { label: "B", text: "Nifedipine" },
      { label: "C", text: "Prazosin" },
      { label: "D", text: "Hydralazine" },
    ], correct: "D",
  },
  {
    id: 75, section: "Pharmacology", number: 12,
    text: "Regarding methyldopa, which is NOT true?",
    options: [
      { label: "A", text: "It is metabolized to alpha-methylnoradrenaline in order to be active" },
      { label: "B", text: "Its antihypertensive effect results primarily from peripheral action" },
      { label: "C", text: "Long use is associated with a positive Coombs test and haemolytic anaemia" },
      { label: "D", text: "Common side effects are sedation and impaired concentration" },
    ], correct: "B",
  },
  {
    id: 76, section: "Pharmacology", number: 13,
    text: "Which of the following regarding hydralazine is TRUE?",
    options: [
      { label: "A", text: "Dilates veins but not arteries" },
      { label: "B", text: "Has low first pass metabolism" },
      { label: "C", text: "May provoke angina or ischaemic arrhythmias in patients with ischaemic heart disease" },
      { label: "D", text: "Works best as single therapy for hypertension" },
    ], correct: "C",
  },
  {
    id: 77, section: "Pharmacology", number: 14,
    text: "With respect to angiotensin converting enzyme (ACE) inhibitors, which statement is CORRECT?",
    options: [
      { label: "A", text: "Decreased levels of bradykinin are associated with their use" },
      { label: "B", text: "There is a strong correlation between plasma renin activity and antihypertensive response" },
      { label: "C", text: "Concomitant use of NSAIDs may decrease the hypotensive effects" },
      { label: "D", text: "Most ACE inhibitors are cleared by hepatic metabolism" },
    ], correct: "C",
  },
  {
    id: 78, section: "Pharmacology", number: 15,
    text: "Nitrates, either directly or via reflexes, cause all of the following EXCEPT:",
    options: [
      { label: "A", text: "Tachycardia" },
      { label: "B", text: "Decrease in contractility" },
      { label: "C", text: "Increase in venous capacitance" },
      { label: "D", text: "Decrease in afterload" },
    ], correct: "B",
  },
  {
    id: 79, section: "Pharmacology", number: 16,
    text: "Which of the following statements regarding antihypertensives and their site of action is CORRECT?",
    options: [
      { label: "A", text: "Beta receptors of the heart – propranolol" },
      { label: "B", text: "Alpha receptors of vessels – hydralazine" },
      { label: "C", text: "Vascular smooth muscle – nitroprusside" },
      { label: "D", text: "Angiotensin receptors of vessels – losartan" },
    ], correct: "D",
  },
  {
    id: 80, section: "Pharmacology", number: 17,
    text: "Which of the following correctly explains the anti-arrhythmic property of atropine?",
    options: [
      { label: "A", text: "Decreases automaticity of ectopic pacemakers" },
      { label: "B", text: "Increases automaticity of all parts of the heart and promotes AV nodal conductance" },
      { label: "C", text: "Prevents re-entry excitation and partially blocks AV nodal conduction of supraventricular arrhythmias" },
      { label: "D", text: "Prevents vagally-induced inhibition of supraventricular pacemakers and AV nodal conduction" },
    ], correct: "D",
  },
  {
    id: 81, section: "Pharmacology", number: 18,
    text: "Problems associated with the use of angiotensin converting enzyme inhibitors include all of the following EXCEPT:",
    options: [
      { label: "A", text: "Angioedema" },
      { label: "B", text: "Atrial fibrillation" },
      { label: "C", text: "Dry cough" },
      { label: "D", text: "Potassium retention" },
    ], correct: "B",
  },
  {
    id: 82, section: "Pharmacology", number: 19,
    text: "Which of the following is NOT a class III antiarrhythmic agent?",
    options: [
      { label: "A", text: "Amiodarone" },
      { label: "B", text: "Bretylium" },
      { label: "C", text: "Disopyramide" },
      { label: "D", text: "Ibutilide" },
    ], correct: "C",
  },
  {
    id: 83, section: "Pharmacology", number: 20,
    text: "Class IV antiarrhythmic agents exert their therapeutic action by blocking:",
    options: [
      { label: "A", text: "Ca2+ channels" },
      { label: "B", text: "K+ channels" },
      { label: "C", text: "Na+ channels" },
      { label: "D", text: "β-adrenergic receptors" },
    ], correct: "A",
  },
  {
    id: 84, section: "Pharmacology", number: 21,
    text: "Verapamil is contraindicated in arrhythmia with accompanying heart failure BECAUSE verapamil:",
    options: [
      { label: "A", text: "Does not act on L-type Ca2+ channel on the heart" },
      { label: "B", text: "Exerts potent negative inotropic effects" },
      { label: "C", text: "Produces reflex tachycardia owing to excessive peripheral vasodilation" },
      { label: "D", text: "Prolongs refractoriness in nodal regions of cardiac myocyte" },
    ], correct: "B",
  },
  {
    id: 85, section: "Pharmacology", number: 22,
    text: "The usefulness of digoxin in abolishing atrial flutter and atrial fibrillation resides in its ability to:",
    options: [
      { label: "A", text: "Decrease intracellular Ca2+ by blocking the Na+/Ca2+ exchanger" },
      { label: "B", text: "Increase chronotropic effect at therapeutic concentrations" },
      { label: "C", text: "Inhibit the Na+/K+-ATPase activity in cardiac myocytes" },
      { label: "D", text: "Potentiate vagal inhibition in SA node and AV node conduction" },
    ], correct: "D",
  },
  {
    id: 86, section: "Pharmacology", number: 23,
    text: "Digitalis-induced bradycardia in the normal heart is due to:",
    options: [
      { label: "A", text: "Decreased conduction through the AV node" },
      { label: "B", text: "Increased vagal tone" },
      { label: "C", text: "Decrease in fluid load" },
      { label: "D", text: "Peripheral vasodilation" },
    ], correct: "B",
  },
  {
    id: 87, section: "Pharmacology", number: 24,
    text: "The mode of action of Class III anti-arrhythmic drugs is by:",
    options: [
      { label: "A", text: "Increasing AV nodal conduction" },
      { label: "B", text: "Increasing PR interval" },
      { label: "C", text: "Prolonging AV refractoriness and reducing adrenergic activity" },
      { label: "D", text: "Prolonging effective refractory period by prolonging action potential" },
    ], correct: "D",
  },
  {
    id: 88, section: "Pharmacology", number: 25,
    text: "The following are major side effects of nitrates and nitrites drugs EXCEPT:",
    options: [
      { label: "A", text: "Orthostatic hypotension" },
      { label: "B", text: "GI disturbance" },
      { label: "C", text: "Throbbing headache" },
      { label: "D", text: "Tolerance" },
    ], correct: "B",
  },
  {
    id: 89, section: "Pharmacology", number: 26,
    text: "Minoxidil lowers peripheral vascular resistance by:",
    options: [
      { label: "A", text: "Increasing cellular NO" },
      { label: "B", text: "Opening Ca2+ channels" },
      { label: "C", text: "Opening Cl- channels" },
      { label: "D", text: "Opening K+ channels" },
    ], correct: "D",
  },
  {
    id: 90, section: "Pharmacology", number: 27,
    text: "Which of the following is the least favourable antihypertensive combination?",
    options: [
      { label: "A", text: "Bisoprolol plus amlodipine" },
      { label: "B", text: "Bisoprolol plus hydrochlorothiazide" },
      { label: "C", text: "Bisoprolol plus prazosin" },
      { label: "D", text: "Bisoprolol plus verapamil" },
    ], correct: "D",
  },
  {
    id: 91, section: "Pharmacology", number: 28,
    text: "Clinically useful angiotensin converting enzyme inhibitors do NOT include:",
    options: [
      { label: "A", text: "Bepridil" },
      { label: "B", text: "Captopril" },
      { label: "C", text: "Enalapril" },
      { label: "D", text: "None of the above" },
    ], correct: "A",
  },
  {
    id: 92, section: "Pharmacology", number: 29,
    text: "Advantages of beta-adrenergic receptor blockers as antihypertensive drugs include the following EXCEPT:",
    options: [
      { label: "A", text: "No postural hypertension" },
      { label: "B", text: "No salt and water retention" },
      { label: "C", text: "Once a day regime" },
      { label: "D", text: "Preferred in young obese patients" },
    ], correct: "D",
  },
  {
    id: 93, section: "Pharmacology", number: 30,
    text: "An antihypertensive suitable for the elderly but best avoided in diabetics is:",
    options: [
      { label: "A", text: "Amlodipine" },
      { label: "B", text: "Hydrochlorothiazide" },
      { label: "C", text: "Lisinopril" },
      { label: "D", text: "Prazosin" },
    ], correct: "B",
  },
  {
    id: 94, section: "Pharmacology", number: 31,
    text: "The following are important classes of antihypertensive drugs EXCEPT:",
    options: [
      { label: "A", text: "Alpha adrenoceptor blocker" },
      { label: "B", text: "Angiotensin II receptors agonists" },
      { label: "C", text: "Diuretics" },
      { label: "D", text: "K+ channel openers" },
    ], correct: "B",
  },
  {
    id: 95, section: "Pharmacology", number: 32,
    text: "Which of the following class of antihypertensive agents are effective in low renin hypertension?",
    options: [
      { label: "A", text: "Angiotensin Converting Enzyme inhibitors" },
      { label: "B", text: "Beta-adrenoceptor blockers" },
      { label: "C", text: "Calcium channel blockers" },
      { label: "D", text: "Loop diuretics" },
    ], correct: "C",
  },
  {
    id: 96, section: "Pharmacology", number: 33,
    text: "Which of the following about antihypertensive calcium channel blockers is NOT correct?",
    options: [
      { label: "A", text: "They are effective in low renin hypertension" },
      { label: "B", text: "They cannot be given to asthma and angina patients" },
      { label: "C", text: "They do not impair renal and male sexual function" },
      { label: "D", text: "They possess no adverse fetal effects and can be given in pregnancy" },
    ], correct: "B",
  },
  {
    id: 97, section: "Pharmacology", number: 34,
    text: "A 45-year-old man has recently been diagnosed with hypertension and started on monotherapy designed to reduce peripheral resistance and prevent NaCl and water retention. He has developed a persistent cough. Which of the following drugs would have the same benefits but would not cause cough?",
    options: [
      { label: "A", text: "Losartan" },
      { label: "B", text: "Nifedipine" },
      { label: "C", text: "Prazosin" },
      { label: "D", text: "Propranolol" },
    ], correct: "A",
  },
  {
    id: 98, section: "Pharmacology", number: 35,
    text: "Antiarrhythmic drugs may work in any of the following ways EXCEPT:",
    options: [
      { label: "A", text: "Calcium channel blockade" },
      { label: "B", text: "Reducing ectopic pacemaker activity" },
      { label: "C", text: "Reducing the effective refractory period" },
      { label: "D", text: "Sodium channel blockade" },
    ], correct: "C",
  },
  {
    id: 99, section: "Pharmacology", number: 36,
    text: "Which of the following does NOT prolong the effective refractory period in the atrioventricular node?",
    options: [
      { label: "A", text: "Amiodarone" },
      { label: "B", text: "Phenytoin" },
      { label: "C", text: "Propranolol" },
      { label: "D", text: "Verapamil" },
    ], correct: "B",
  },
  {
    id: 100, section: "Pharmacology", number: 37,
    text: "A patient is prescribed isosorbide dinitrate for angina. Which medication should the patient be warned NOT to take concurrently?",
    options: [
      { label: "A", text: "Aspirin (low dose)" },
      { label: "B", text: "Metoprolol" },
      { label: "C", text: "Sildenafil" },
      { label: "D", text: "Grapefruit juice" },
    ], correct: "C",
  },
  {
    id: 101, section: "Pharmacology", number: 38,
    text: "What is the primary mechanism by which calcium channel blockers help manage exertional angina?",
    options: [
      { label: "A", text: "Decrease heart rate and contractility" },
      { label: "B", text: "Increase myocardial oxygen demand" },
      { label: "C", text: "Enhance coronary blood flow through increased contractility" },
      { label: "D", text: "Decrease preload only" },
    ], correct: "A",
  },
  {
    id: 102, section: "Pharmacology", number: 39,
    text: "Which side effect is commonly associated with amlodipine, a calcium channel blocker, used in treating angina?",
    options: [
      { label: "A", text: "Bradycardia" },
      { label: "B", text: "Cough" },
      { label: "C", text: "Edema" },
      { label: "D", text: "QT prolongation" },
    ], correct: "C",
  },
  {
    id: 103, section: "Pharmacology", number: 40,
    text: "A patient on furosemide presents with symptoms of dizziness and weakness. What laboratory abnormality should be monitored due to the risk of this medication?",
    options: [
      { label: "A", text: "Hyperkalemia" },
      { label: "B", text: "Hyponatremia" },
      { label: "C", text: "Hypercalcemia" },
      { label: "D", text: "Hyperuricemia" },
    ], correct: "B",
  },
  {
    id: 104, section: "Pharmacology", number: 41,
    text: "What is the primary mechanism by which beta-blockers help in managing heart failure?",
    options: [
      { label: "A", text: "Diuresis" },
      { label: "B", text: "Decreased heart rate and contractility" },
      { label: "C", text: "Vasodilation" },
      { label: "D", text: "Increased cardiac output" },
    ], correct: "B",
  },
  {
    id: 105, section: "Pharmacology", number: 42,
    text: "In which of the following scenarios would the use of beta-blockers be contraindicated?",
    options: [
      { label: "A", text: "Patient with stable angina" },
      { label: "B", text: "Patient with acute decompensated heart failure" },
      { label: "C", text: "Patient with hypertension" },
      { label: "D", text: "Patient with a history of myocardial infarction" },
    ], correct: "B",
  },
  {
    id: 106, section: "Pharmacology", number: 43,
    text: "What is the primary benefit of adding an aldosterone antagonist, such as spironolactone, to the treatment regimen for heart failure with reduced ejection fraction?",
    options: [
      { label: "A", text: "Reducing preload" },
      { label: "B", text: "Preventing potassium loss" },
      { label: "C", text: "Improving renal function" },
      { label: "D", text: "Reducing mortality risk" },
    ], correct: "D",
  },
  {
    id: 107, section: "Pharmacology", number: 44,
    text: "A patient is started on digoxin for heart failure. What is a crucial parameter that should be monitored regularly?",
    options: [
      { label: "A", text: "Blood pressure only" },
      { label: "B", text: "Serum potassium levels only" },
      { label: "C", text: "Heart rate and serum digoxin levels" },
      { label: "D", text: "Liver function tests only" },
    ], correct: "C",
  },
  {
    id: 108, section: "Pharmacology", number: 45,
    text: "Which symptom would most likely indicate digoxin toxicity in a patient?",
    options: [
      { label: "A", text: "Increased appetite" },
      { label: "B", text: "Blurred vision or yellow-green halos around lights" },
      { label: "C", text: "Weight gain" },
      { label: "D", text: "Increased urination" },
    ], correct: "B",
  },
  {
    id: 109, section: "Pharmacology", number: 46,
    text: "A patient is started on lisinopril for hypertension. What laboratory test should be monitored regularly to assess for potential adverse effects?",
    options: [
      { label: "A", text: "Blood glucose levels" },
      { label: "B", text: "Serum creatinine and potassium levels" },
      { label: "C", text: "Liver function tests" },
      { label: "D", text: "Complete blood count" },
    ], correct: "B",
  },
  {
    id: 110, section: "Pharmacology", number: 47,
    text: "A patient on amlodipine reports experiencing swelling in the lower extremities. What is this side effect commonly associated with?",
    options: [
      { label: "A", text: "Hyperkalemia" },
      { label: "B", text: "Peripheral edema" },
      { label: "C", text: "Bradycardia" },
      { label: "D", text: "Hypotension" },
    ], correct: "B",
  },
  {
    id: 111, section: "Pharmacology", number: 48,
    text: "Which of the following conditions would contraindicate the use of beta-blockers in a patient with hypertension?",
    options: [
      { label: "A", text: "History of myocardial infarction" },
      { label: "B", text: "Asthma or reactive airway disease" },
      { label: "C", text: "Chronic kidney disease" },
      { label: "D", text: "Diabetes mellitus" },
    ], correct: "B",
  },
  {
    id: 112, section: "Pharmacology", number: 49,
    text: "What is the primary mechanism by which ACE inhibitors lower blood pressure?",
    options: [
      { label: "A", text: "Decreasing heart rate" },
      { label: "B", text: "Promoting vasodilation through angiotensin II blockade" },
      { label: "C", text: "Increasing renal excretion of sodium and water" },
      { label: "D", text: "Inhibiting calcium influx into vascular smooth muscle" },
    ], correct: "B",
  },
  {
    id: 113, section: "Pharmacology", number: 50,
    text: "In which scenario would an aldosterone antagonist, such as spironolactone, be particularly indicated in a hypertensive patient?",
    options: [
      { label: "A", text: "Patient with asthma" },
      { label: "B", text: "Patient with heart failure and reduced ejection fraction" },
      { label: "C", text: "Patient with chronic liver disease" },
      { label: "D", text: "Patient with isolated systolic hypertension" },
    ], correct: "B",
  },
  {
    id: 114, section: "Pharmacology", number: 51,
    text: "A patient on lisinopril is prescribed potassium supplements. What should be monitored due to the risk of hyperkalemia?",
    options: [
      { label: "A", text: "Blood glucose levels" },
      { label: "B", text: "Serum potassium levels" },
      { label: "C", text: "Liver function tests" },
      { label: "D", text: "Complete blood count" },
    ], correct: "B",
  },
  {
    id: 115, section: "Pharmacology", number: 52,
    text: "Which of the following drugs reduces blood pressure by acting centrally?",
    options: [
      { label: "A", text: "Labetalol" },
      { label: "B", text: "Clonidine" },
      { label: "C", text: "Enalapril" },
      { label: "D", text: "Nifedipine" },
    ], correct: "B",
  },
  {
    id: 116, section: "Pharmacology", number: 53,
    text: "Which drug provides significant relaxation of smooth muscles of both venules and arterioles?",
    options: [
      { label: "A", text: "Nifedipine" },
      { label: "B", text: "Diazoxide" },
      { label: "C", text: "Sodium nitroprusside" },
      { label: "D", text: "Minoxidil" },
    ], correct: "C",
  },
  {
    id: 117, section: "Pharmacology", number: 54,
    text: "Which class of drugs is primarily used to treat hypertension by inhibiting the renin-angiotensin-aldosterone system?",
    options: [
      { label: "A", text: "Beta-blockers" },
      { label: "B", text: "Calcium channel blockers" },
      { label: "C", text: "ACE inhibitors" },
      { label: "D", text: "Diuretics" },
    ], correct: "C",
  },
  {
    id: 118, section: "Pharmacology", number: 55,
    text: "Which drug is classified as a Class IC antiarrhythmic agent?",
    options: [
      { label: "A", text: "Lidocaine" },
      { label: "B", text: "Flecainide" },
      { label: "C", text: "Sotalol" },
      { label: "D", text: "Propranolol" },
    ], correct: "B",
  },
  {
    id: 119, section: "Pharmacology", number: 56,
    text: "A 46-year-old man treated with a thiazide diuretic for 5 years now has rising diastolic pressure and is started on a second antihypertensive. He complains of inability to achieve an erection and inability to complete 3 sets of tennis. Which second antihypertensive drug is most likely to cause these complaints?",
    options: [
      { label: "A", text: "Metoprolol" },
      { label: "B", text: "Captopril" },
      { label: "C", text: "Losartan" },
      { label: "D", text: "Nifedipine" },
    ], correct: "A",
  },
  {
    id: 120, section: "Pharmacology", number: 57,
    text: "The therapeutic benefit of propranolol in angina is believed to be primarily due to:",
    options: [
      { label: "A", text: "Reduced production of catecholamines" },
      { label: "B", text: "A decreased requirement of myocardial oxygen" },
      { label: "C", text: "Increased sensitivity to catecholamines" },
      { label: "D", text: "Increased peripheral resistance" },
    ], correct: "B",
  },
  {
    id: 121, section: "Pharmacology", number: 58,
    text: "Which of the following drugs is not used for the management of congestive heart failure?",
    options: [
      { label: "A", text: "Enalapril" },
      { label: "B", text: "Nifedipine" },
      { label: "C", text: "Propranolol" },
      { label: "D", text: "Digoxin" },
    ], correct: "B",
  },
  {
    id: 122, section: "Pharmacology", number: 59,
    text: "Which of the following class of anti-arrhythmic drug suppresses abnormal automaticity and permits the sinoatrial node to again assume the role of a dominant pacemaker?",
    options: [
      { label: "A", text: "Class I" },
      { label: "B", text: "Class II" },
      { label: "C", text: "Class III" },
      { label: "D", text: "Class IV" },
    ], correct: "A",
  },
  {
    id: 123, section: "Pharmacology", number: 60,
    text: "If quinidine and digoxin are administered concurrently, what effect does quinidine have on digoxin?",
    options: [
      { label: "A", text: "Plasma concentration of digoxin is increased" },
      { label: "B", text: "Absorption of digoxin from the gastrointestinal tract is decreased" },
      { label: "C", text: "Effect of digoxin on the AV node is antagonized" },
      { label: "D", text: "Metabolism of digoxin is prevented" },
    ], correct: "A",
  },
  {
    id: 124, section: "Pharmacology", number: 61,
    text: "Which drug is prescribed for prophylaxis against exertional angina but is not effective for variant (vasospastic) angina?",
    options: [
      { label: "A", text: "Clopidogrel" },
      { label: "B", text: "Nifedipine" },
      { label: "C", text: "Nitroglycerin" },
      { label: "D", text: "Propranolol" },
    ], correct: "D",
  },
  {
    id: 125, section: "Pharmacology", number: 62,
    text: "A 60-year-old patient with newly diagnosed hypertension presents for treatment. Which of the following medications is considered first-line therapy?",
    options: [
      { label: "A", text: "Amlodipine / Lisinopril / Hydrochlorothiazide (All first-line)" },
      { label: "B", text: "Metoprolol" },
      { label: "C", text: "Hydrochlorothiazide" },
      { label: "D", text: "Lisinopril" },
    ], correct: "C",
  },
];

const PATH: PQQuestion[] = [
  {
    id: 126, section: "Pathology", number: 1,
    text: "Atherosclerotic plaque changes that define acute myocardial infarction do NOT include:",
    options: [
      { label: "A", text: "Rupture / superficial erosion" },
      { label: "B", text: "Deep hemorrhage" },
      { label: "C", text: "Ulceration/fissuring" },
      { label: "D", text: "Fixed occlusion of 75% of LAD coronary artery" },
    ], correct: "D",
  },
  {
    id: 127, section: "Pathology", number: 2,
    text: "Hypertrophic cardiomyopathy (HCM) is characterized by myocardial hypertrophy. Genetically this condition is most commonly a result of mutations in proteins that relate to:",
    options: [
      { label: "A", text: "Mitochondria" },
      { label: "B", text: "Cytoskeleton" },
      { label: "C", text: "Nuclear envelope" },
      { label: "D", text: "Sarcomere" },
    ], correct: "D",
  },
  {
    id: 128, section: "Pathology", number: 3,
    text: "Angina pectoris results from decreased myocardial perfusion. This is a result of all the following EXCEPT:",
    options: [
      { label: "A", text: "Coronary arterial pathology" },
      { label: "B", text: "Total occlusion of coronary vessel" },
      { label: "C", text: "Decreased myocardial perfusion" },
      { label: "D", text: "Increased myocardial demand" },
    ], correct: "B",
  },
  {
    id: 129, section: "Pathology", number: 4,
    text: "The following CHDs usually present clinically as left-to-right shunts EXCEPT:",
    options: [
      { label: "A", text: "Atrial Septal Defect" },
      { label: "B", text: "Patent Ductus Arteriosus" },
      { label: "C", text: "Tetralogy of Fallot" },
      { label: "D", text: "Ventricular Septal Defect" },
    ], correct: "C",
  },
  {
    id: 130, section: "Pathology", number: 5,
    text: "Focal myocardial ischemia commonly results in hypertrophic cardiomyopathy. This cannot be attributed to:",
    options: [
      { label: "A", text: "Abnormal intramural arteries" },
      { label: "B", text: "Worsening atherosclerosis from response to injury" },
      { label: "C", text: "High left ventricular chamber pressure" },
      { label: "D", text: "Massive hypertrophy" },
    ], correct: "B",
  },
  {
    id: 131, section: "Pathology", number: 6,
    text: "Atherosclerosis is characterized by plaques. Acute changes that may occur in a plaque do NOT include:",
    options: [
      { label: "A", text: "Rupture/fissuring" },
      { label: "B", text: "Erosion/ulceration" },
      { label: "C", text: "Dissolution of plaques" },
      { label: "D", text: "Hemorrhage into the atheroma, expanding its volume" },
    ], correct: "C",
  },
  {
    id: 132, section: "Pathology", number: 7,
    text: "Morphologically, the hypertrophy associated with hypertrophic cardiomyopathy is NOT characterized by:",
    options: [
      { label: "A", text: "Bulging of the ventricular septum into the lumen of the heart" },
      { label: "B", text: "Asymmetry and septal location" },
      { label: "C", text: "Subaortic dominance" },
      { label: "D", text: "Symmetry and concentric distribution" },
    ], correct: "D",
  },
  {
    id: 133, section: "Pathology", number: 8,
    text: "Concerning tumours of the heart, the commonest type and location of the tumour is:",
    options: [
      { label: "A", text: "A right atrial myxoma" },
      { label: "B", text: "A right ventricular myxoma" },
      { label: "C", text: "A left atrial myxoma" },
      { label: "D", text: "A left ventricular myxoma" },
    ], correct: "C",
  },
  {
    id: 134, section: "Pathology", number: 9,
    text: "Coronary atherosclerosis is a cause of myocardial ischemia in adults. Other common causes of myocardial ischemia include the following EXCEPT:",
    options: [
      { label: "A", text: "Lowered systemic blood pressure" },
      { label: "B", text: "Kawasaki disease" },
      { label: "C", text: "Coronary emboli" },
      { label: "D", text: "Blockage of small myocardial blood vessels" },
    ], correct: "A",
  },
  {
    id: 135, section: "Pathology", number: 10,
    text: "A 28-year-old woman admitted to the emergency room because of sudden onset breathlessness with hemoptysis is 3-weeks postpartum. An echo suggests she has an enlarged heart with dilated chambers. The defining features of this patient's condition include all the following EXCEPT:",
    options: [
      { label: "A", text: "Endocardial fibrosis" },
      { label: "B", text: "Intracardiac thrombi" },
      { label: "C", text: "Chamber dilation" },
      { label: "D", text: "Hypertrophy" },
    ], correct: "A",
  },
  {
    id: 136, section: "Pathology", number: 11,
    text: "Concerning tumours of the heart, secondary tumors have all the following features except:",
    options: [
      { label: "A", text: "Reach the heart through direct extension" },
      { label: "B", text: "Signal a poor prognosis" },
      { label: "C", text: "Reach the heart through the hematogenous route" },
      { label: "D", text: "Most of them are benign" },
    ], correct: "D",
  },
  {
    id: 137, section: "Pathology", number: 12,
    text: "Classic features of Tetralogy of Fallot include all BUT:",
    options: [
      { label: "A", text: "Pulmonary Stenosis" },
      { label: "B", text: "Ventricular Septal Defect" },
      { label: "C", text: "Overriding Aorta" },
      { label: "D", text: "Right Atrial Hypertrophy" },
    ], correct: "D",
  },
  {
    id: 138, section: "Pathology", number: 13,
    text: "Hypertrophic cardiomyopathy (HCM) results in all the following EXCEPT:",
    options: [
      { label: "A", text: "Abnormal diastolic filling" },
      { label: "B", text: "Intermittent ventricular outflow obstruction" },
      { label: "C", text: "Systolic dysfunction" },
      { label: "D", text: "Poorly compliant left ventricular myocardium" },
    ], correct: "C",
  },
  {
    id: 139, section: "Pathology", number: 14,
    text: "Concerning vulnerable plaques in atherosclerosis, these are characterized by all the following EXCEPT:",
    options: [
      { label: "A", text: "Thin fibrous caps" },
      { label: "B", text: "Large areas of foam cells and extracellular lipid" },
      { label: "C", text: "Numerous smooth muscle cells" },
      { label: "D", text: "Clusters of inflammatory cells" },
    ], correct: "C",
  },
  {
    id: 140, section: "Pathology", number: 15,
    text: "The underlying pathology of myocardial infarction is:",
    options: [
      { label: "A", text: "Hypercholesterolemia" },
      { label: "B", text: "Thrombosis" },
      { label: "C", text: "Inflammation" },
      { label: "D", text: "Anaemia" },
    ], correct: "B",
  },
  {
    id: 141, section: "Pathology", number: 16,
    text: "A 28-year-old woman admitted to the emergency room because of sudden onset breathlessness with hemoptysis is 3 weeks postpartum. An echo suggests she has an enlarged heart with dilated chambers. A review reveals the woman has lost vision in the left eye and has left hemiparesis. She most likely has:",
    options: [
      { label: "A", text: "Subdural abscess" },
      { label: "B", text: "Metastatic choriocarcinoma" },
      { label: "C", text: "Amniotic fluid embolism" },
      { label: "D", text: "Thromboembolism" },
    ], correct: "D",
  },
  {
    id: 142, section: "Pathology", number: 17,
    text: "Physiologic derangements that are associated with hypertrophic cardiomyopathy do NOT include:",
    options: [
      { label: "A", text: "Dynamic obstruction to the left ventricular outflow" },
      { label: "B", text: "Impaired diastolic filling" },
      { label: "C", text: "Limitation of cardiac output" },
      { label: "D", text: "Harsh diastolic murmur" },
    ], correct: "D",
  },
  {
    id: 143, section: "Pathology", number: 18,
    text: "Transmural MI occurs in the absence of the typical coronary vascular pathology on occasion. Under these circumstances, the underlying mechanisms do NOT include:",
    options: [
      { label: "A", text: "Vasospasm" },
      { label: "B", text: "Emboli from the heart" },
      { label: "C", text: "Acute plaque changes in atherosclerosis" },
      { label: "D", text: "Ischemia without detectable coronary atherosclerosis and thrombosis" },
    ], correct: "C",
  },
  {
    id: 144, section: "Pathology", number: 19,
    text: "The most important histologic features of the myocardium in hypertrophic cardiomyopathy do NOT include:",
    options: [
      { label: "A", text: "Haphazard disarray of bundles of myocytes" },
      { label: "B", text: "Interstitial and replacement fibrosis" },
      { label: "C", text: "Extensive myocyte hypertrophy" },
      { label: "D", text: "Scattered myocyte atrophy" },
    ], correct: "D",
  },
  {
    id: 145, section: "Pathology", number: 20,
    text: "A 28-year-old woman 3 weeks postpartum has an enlarged heart with dilated chambers. Her condition may be related to all the following EXCEPT:",
    options: [
      { label: "A", text: "Volume overload" },
      { label: "B", text: "Nutritional deficiency" },
      { label: "C", text: "Pregnancy-associated hypertension" },
      { label: "D", text: "Puerperal sepsis" },
    ], correct: "D",
  },
  {
    id: 146, section: "Pathology", number: 21,
    text: "A 23-year-old man presented with symptoms and signs of bacterial endocarditis. Which of the following statements is true regarding endocarditis?",
    options: [
      { label: "A", text: "The vegetations are small and firm, involving the entire margin of the valve leaflet" },
      { label: "B", text: "It never occurs on normal valves" },
      { label: "C", text: "Septic emboli from them may result in infarcts and abscesses in the kidney, spleen, and brain" },
      { label: "D", text: "Prosthetic heart valves do not develop endocarditis" },
    ], correct: "C",
  },
  {
    id: 147, section: "Pathology", number: 22,
    text: "A 40-year-old footballer collapses during a competitive match. His father died suddenly at age 35. Autopsy and histology is likely to reveal which of the following findings of the heart?",
    options: [
      { label: "A", text: "Extensive myocardial hemosiderin deposition" },
      { label: "B", text: "Haphazardly arranged hypertrophied septal myocytes" },
      { label: "C", text: "Large, friable vegetations with destruction of aortic valve cusps" },
      { label: "D", text: "Tachyzoites within foci of myocardial necrosis and inflammation" },
    ], correct: "B",
  },
  {
    id: 148, section: "Pathology", number: 23,
    text: "The most common cause of myocardial infarction is:",
    options: [
      { label: "A", text: "Thrombosis on an atheromatous plaque in a coronary artery" },
      { label: "B", text: "Luminal narrowing by atherosclerotic material in coronary arteries" },
      { label: "C", text: "Ostial stenosis of coronary arteries" },
      { label: "D", text: "Embolization from a mural thrombus" },
    ], correct: "A",
  },
  {
    id: 149, section: "Pathology", number: 24,
    text: "All of the following statements concerning myocardial infarction are true except:",
    options: [
      { label: "A", text: "May be unrecognizable at autopsy if the patient dies within four or five hours after the infarction" },
      { label: "B", text: "May be followed by systemic arterial occlusions" },
      { label: "C", text: "Need not be associated with vascular occlusion" },
      { label: "D", text: "Is uncommon in hypertension because of capillary proliferation developed secondary to myocardial hypertrophy" },
    ], correct: "D",
  },
  {
    id: 150, section: "Pathology", number: 25,
    text: "A six-year-old boy developed sore throat. Three weeks later he started spiking temperature with arthritis and development of a new murmur. Changes typical of acute rheumatic carditis include:",
    options: [
      { label: "A", text: "Aschoff bodies containing B-hemolytic streptococci" },
      { label: "B", text: "Verrucous endocarditis" },
      { label: "C", text: "Ruptured chordae tendineae" },
      { label: "D", text: "Mitral stenosis" },
    ], correct: "B",
  },
  {
    id: 151, section: "Pathology", number: 26,
    text: "A 22-year-old footballer with no pre-existing conditions presents with severe positional chest pain of three hours duration. His ECG shows widespread saddle-shaped ST elevation. He is haemodynamically stable. Which of the following medications will be helpful to him?",
    options: [
      { label: "A", text: "Clexane" },
      { label: "B", text: "Clopidogrel" },
      { label: "C", text: "Isosorbide Dinitrate" },
      { label: "D", text: "Ibuprofen" },
    ], correct: "D",
  },
  {
    id: 152, section: "Pathology", number: 27,
    text: "Cardiomyopathy may occur in association with which of the following combination?",
    options: [
      { label: "A", text: "Amyloidosis and Chronic alcoholism only" },
      { label: "B", text: "Viral infections and Amyloidosis only" },
      { label: "C", text: "Viral infections, glycogen storage disease and chronic alcoholism" },
      { label: "D", text: "Viral infections and Chronic alcoholism only" },
    ], correct: "C",
  },
  {
    id: 153, section: "Pathology", number: 28,
    text: "A 57-year-old man presented with features of heart failure. History and examination suggested restrictive cardiomyopathy. Which of the following characteristically occurs in restrictive cardiomyopathy?",
    options: [
      { label: "A", text: "Beriberi (thiamine deficiency)" },
      { label: "B", text: "Asymmetric septal hypertrophy" },
      { label: "C", text: "Amyloidosis" },
      { label: "D", text: "Alcoholism" },
    ], correct: "C",
  },
  {
    id: 154, section: "Pathology", number: 29,
    text: "A 2-year-old child is brought to the physician for a routine examination. Physical examination shows a low-pitched cardiac murmur. An echocardiogram shows the presence of ostium secundum, with a 1-cm defect. Which of the following abnormalities is most likely to be found in this child?",
    options: [
      { label: "A", text: "Left-to-right shunt" },
      { label: "B", text: "Pericardial effusion" },
      { label: "C", text: "Pulmonary hypertension" },
      { label: "D", text: "Cyanosis" },
    ], correct: "A",
  },
  {
    id: 155, section: "Pathology", number: 30,
    text: "The commonest cause of death in HCM is:",
    options: [
      { label: "A", text: "Supraventricular Tachycardia" },
      { label: "B", text: "Atrial Flutter" },
      { label: "C", text: "Ventricular Tachycardia / Ventricular Fibrillation" },
      { label: "D", text: "Atrial Fibrillation" },
    ], correct: "C",
  },
  {
    id: 156, section: "Pathology", number: 31,
    text: "Life-threatening complications of acute myocardial infarcts include all of the following EXCEPT:",
    options: [
      { label: "A", text: "Rupture of the myocardium" },
      { label: "B", text: "Endocardial fibroelastosis" },
      { label: "C", text: "Extension of the infarct" },
      { label: "D", text: "Cardiac rhythm disturbance" },
    ], correct: "B",
  },
  {
    id: 157, section: "Pathology", number: 32,
    text: "The complication of myocardial infarct that is least likely is:",
    options: [
      { label: "A", text: "Rupture of the right ventricle" },
      { label: "B", text: "Systemic thromboemboli and consequent infarcts" },
      { label: "C", text: "Rupture of the posterior papillary muscle of the mitral valve" },
      { label: "D", text: "Heart block" },
    ], correct: "A",
  },
  {
    id: 158, section: "Pathology", number: 33,
    text: "A 45-year-old diabetic hypertensive presented with sudden substernal chest pain. Coronary angiography shows about 70% occlusion of branches of the left coronary artery. Which of the following complications is likely to occur in this patient in the next one hour?",
    options: [
      { label: "A", text: "Ventricular fibrillation" },
      { label: "B", text: "Pericarditis" },
      { label: "C", text: "Myocardial fibrosis" },
      { label: "D", text: "Mural thrombosis" },
    ], correct: "A",
  },
  {
    id: 159, section: "Pathology", number: 34,
    text: "Adwoa Mansa, an alcoholic with dilated congestive cardiomyopathy, presents with weakness in the left arm and leg and right sided facial weakness. The best diagnosis is:",
    options: [
      { label: "A", text: "Thrombophlebitis of left thigh with embolism" },
      { label: "B", text: "Mural thrombosis of right atrium with embolism" },
      { label: "C", text: "Thrombosis of right middle cerebral artery branch" },
      { label: "D", text: "Mural thrombosis of left atrium with embolism" },
    ], correct: "D",
  },
  {
    id: 160, section: "Pathology", number: 35,
    text: "A six-year-old boy developed sore throat. Three weeks later he started spiking temperature with arthritis and a new murmur. Complications of rheumatic heart disease include:",
    options: [
      { label: "A", text: "Passive congestion of the lungs" },
      { label: "B", text: "Systemic hypertension" },
      { label: "C", text: "Coronary atherosclerosis" },
      { label: "D", text: "Bacterial endocarditis" },
    ], correct: "D",
  },
  {
    id: 161, section: "Pathology", number: 36,
    text: "A 65-year-old man with 25-year history of post rheumatic mitral stenosis presents with heart failure. All the following are typical of longstanding pure mitral stenosis EXCEPT:",
    options: [
      { label: "A", text: "Thrombosis in left atrium" },
      { label: "B", text: "Pulmonary venous hypertension" },
      { label: "C", text: "Dilatation and hypertrophy of the left atrium" },
      { label: "D", text: "Dilatation and hypertrophy of the left ventricle" },
    ], correct: "D",
  },
  {
    id: 162, section: "Pathology", number: 37,
    text: "Correctly list major lipoproteins in order from largest to smallest:",
    options: [
      { label: "A", text: "Chylomicrons, VLDL, IDL, LDL, HDL" },
      { label: "B", text: "VLDL, chylomicrons, IDL, HDL, LDL" },
      { label: "C", text: "VLDL, IDL, chylomicrons, LDL, HDL" },
      { label: "D", text: "Chylomicrons, VLDL, IDL, HDL, LDL" },
    ], correct: "A",
  },
  {
    id: 163, section: "Pathology", number: 38,
    text: "A middle-aged male had several episodes of chest pain during the last two years. He was admitted to the hospital following a very severe attack which ended in shock. The pain began about an hour before admission. The most likely outcome in this case is:",
    options: [
      { label: "A", text: "Rupture of the myocardium" },
      { label: "B", text: "Cerebral embolism from a mural thrombosis" },
      { label: "C", text: "Survival with reduced cardiac reserve" },
      { label: "D", text: "Death due to congestive heart failure in the third week" },
    ], correct: "C",
  },
  {
    id: 164, section: "Pathology", number: 39,
    text: "Which of the following is the unique feature of rheumatic myocarditis?",
    options: [
      { label: "A", text: "Fibrinoid deposits" },
      { label: "B", text: "Group A hemolytic streptococci" },
      { label: "C", text: "Anitschkow myocytes" },
      { label: "D", text: "Aschoff nodules" },
    ], correct: "D",
  },
  {
    id: 165, section: "Pathology", number: 40,
    text: "A middle-aged man was admitted for chest pain and found to be in shock. Which of the following complications is least expected over the next week?",
    options: [
      { label: "A", text: "Mural thrombosis" },
      { label: "B", text: "Ventricular aneurysm" },
      { label: "C", text: "Congestive failure" },
      { label: "D", text: "Atrial fibrillation" },
    ], correct: "D",
  },
  {
    id: 166, section: "Pathology", number: 41,
    text: "An 8-year-old boy with signs and symptoms of rheumatic heart disease developed atrial fibrillation and left ventricular failure three days after admission with mitral regurgitation. Which of the following pathological phenomenon underpins the child's left ventricular failure?",
    options: [
      { label: "A", text: "Fibrinous pericarditis" },
      { label: "B", text: "Myocarditis" },
      { label: "C", text: "Fibrosis of mitral valve with fusion of commissures" },
      { label: "D", text: "Tamponade" },
    ], correct: "B",
  },
  {
    id: 167, section: "Pathology", number: 42,
    text: "Immediate complications of aortic dissection may include all of the following:",
    options: [
      { label: "A", text: "Cardiac tamponade" },
      { label: "B", text: "Hemorrhagic stroke" },
      { label: "C", text: "Infarctive stroke" },
      { label: "D", text: "Myocardial infarct" },
    ], correct: "A",
  },
  {
    id: 168, section: "Pathology", number: 43,
    text: "A 30-year-old doctor being treated for COVID-19 develops persistent chest pain and syncope. An ECG reveals ventricular tachycardia. What is the diagnosis?",
    options: [
      { label: "A", text: "Torsades de Pointes" },
      { label: "B", text: "Ventricular Tachycardia" },
      { label: "C", text: "Left Bundle Branch Block" },
      { label: "D", text: "Ventricular Fibrillation" },
    ], correct: "B",
  },
];

const CHEM: PQQuestion[] = [
  {
    id: 169, section: "Chemical Pathology", number: 1,
    text: "During a routine examination of a 58-year-old male patient, blood work indicates a significant elevation in the level of homocysteine. Which of the following may contribute to the elevation of homocysteine levels?",
    options: [
      { label: "A", text: "Leptin" },
      { label: "B", text: "Adiponectin" },
      { label: "C", text: "LDL receptor defects" },
      { label: "D", text: "Genetic defects" },
    ], correct: "D",
  },
  {
    id: 170, section: "Chemical Pathology", number: 2,
    text: "Which of the following may be requested in the diagnosis of thromboembolic disease such as deep vein thrombosis?",
    options: [
      { label: "A", text: "Homocysteine" },
      { label: "B", text: "D-dimer" },
      { label: "C", text: "Apolipoprotein B" },
      { label: "D", text: "Troponin I" },
    ], correct: "B",
  },
  {
    id: 171, section: "Chemical Pathology", number: 3,
    text: "Hyperhomocysteinemia can occur in the following situations EXCEPT:",
    options: [
      { label: "A", text: "Hyperthyroidism" },
      { label: "B", text: "Smoking" },
      { label: "C", text: "Genetic defect" },
      { label: "D", text: "Vitamin B6 deficiency" },
    ], correct: "A",
  },
  {
    id: 172, section: "Chemical Pathology", number: 4,
    text: "Which of the following is a known risk factor for developing peripheral vascular disease?",
    options: [
      { label: "A", text: "Hyperhomocysteinaemia" },
      { label: "B", text: "Excessive ingestion of alcohol" },
      { label: "C", text: "Hyperglycaemia" },
      { label: "D", text: "Being of the female sex" },
    ], correct: "A",
  },
  {
    id: 173, section: "Chemical Pathology", number: 5,
    text: "What limits the specificity of myoglobin as a cardiac biomarker?",
    options: [
      { label: "A", text: "Its presence in skeletal muscles" },
      { label: "B", text: "It is released late when there is myocardial injury" },
      { label: "C", text: "Its assay is not well standardized" },
      { label: "D", text: "Its presence in hepatocytes" },
    ], correct: "A",
  },
  {
    id: 174, section: "Chemical Pathology", number: 6,
    text: "Explain the rationale behind the requirement of fasting for lipid assessment.",
    options: [
      { label: "A", text: "LDL cholesterol decreases after a meal" },
      { label: "B", text: "HDL cholesterol changes after a meal" },
      { label: "C", text: "VLDL triglycerides increase after a meal" },
      { label: "D", text: "Chylomicron triglycerides increase after a meal" },
    ], correct: "D",
  },
  {
    id: 175, section: "Chemical Pathology", number: 7,
    text: "Prior to an arterial angiography for a patient who has a history of peripheral vascular disease, which of the following investigations is of vital importance?",
    options: [
      { label: "A", text: "BUE-creatinine" },
      { label: "B", text: "Full blood count" },
      { label: "C", text: "Coagulation profile" },
      { label: "D", text: "CRP" },
    ], correct: "A",
  },
  {
    id: 176, section: "Chemical Pathology", number: 8,
    text: "For a patient who has an elevated Lp(a), the abnormality most likely to be detected by a basic lipid panel is:",
    options: [
      { label: "A", text: "Elevated VLDL cholesterol" },
      { label: "B", text: "Elevated fasting triglycerides" },
      { label: "C", text: "Low HDL cholesterol" },
      { label: "D", text: "Elevated LDL cholesterol" },
    ], correct: "D",
  },
  {
    id: 177, section: "Chemical Pathology", number: 9,
    text: "Which of the following affects the levels of Lp(a)?",
    options: [
      { label: "A", text: "Exercise" },
      { label: "B", text: "Diet" },
      { label: "C", text: "Genetics" },
      { label: "D", text: "Lipid-lowering drugs" },
    ], correct: "C",
  },
  {
    id: 178, section: "Chemical Pathology", number: 10,
    text: "Which of the following is a surrogate marker for apolipoprotein B?",
    options: [
      { label: "A", text: "Lp(a)" },
      { label: "B", text: "Non-HDL cholesterol" },
      { label: "C", text: "Remnant HDL-cholesterol" },
      { label: "D", text: "IDL-cholesterol" },
    ], correct: "B",
  },
  {
    id: 179, section: "Chemical Pathology", number: 11,
    text: "Which cardiac biomarker is important in detecting moderate to severe congestive heart failure (CHF)?",
    options: [
      { label: "A", text: "hs-CRP" },
      { label: "B", text: "BNP" },
      { label: "C", text: "Troponin" },
      { label: "D", text: "Myoglobin" },
    ], correct: "B",
  },
  {
    id: 180, section: "Chemical Pathology", number: 12,
    text: "Which of the following does NOT contribute to the rise of fibrinogen levels?",
    options: [
      { label: "A", text: "BMI" },
      { label: "B", text: "Cholesterol" },
      { label: "C", text: "Age" },
      { label: "D", text: "Triglycerides" },
    ], correct: "B",
  },
  {
    id: 181, section: "Chemical Pathology", number: 13,
    text: "You are examining a 52-year-old female patient during a routine physical. Which of the following tests would be useful for cardiovascular disease risk assessment?",
    options: [
      { label: "A", text: "CK-MB" },
      { label: "B", text: "Myoglobin" },
      { label: "C", text: "High sensitivity C-reactive protein" },
      { label: "D", text: "Troponin" },
    ], correct: "C",
  },
  {
    id: 182, section: "Chemical Pathology", number: 14,
    text: "Which analyte is most appropriate to use as a surrogate for the number of LDL particles?",
    options: [
      { label: "A", text: "Apolipoprotein B" },
      { label: "B", text: "Apolipoprotein CIII" },
      { label: "C", text: "Apolipoprotein E" },
      { label: "D", text: "Apolipoprotein A1" },
    ], correct: "A",
  },
  {
    id: 183, section: "Chemical Pathology", number: 15,
    text: "A 20-year-old obese patient came to your consulting room. Which of the following tests would you order to investigate obesity?",
    options: [
      { label: "A", text: "Leptin" },
      { label: "B", text: "Resistin" },
      { label: "C", text: "Adiponectin" },
      { label: "D", text: "Troponin I" },
    ], correct: "A",
  },
  {
    id: 184, section: "Chemical Pathology", number: 16,
    text: "Which one of the following lipoprotein particles is MOST atherogenic?",
    options: [
      { label: "A", text: "Small, dense LDL" },
      { label: "B", text: "Small, dense VLDL" },
      { label: "C", text: "Remnant LDL" },
      { label: "D", text: "LDL" },
    ], correct: "A",
  },
  {
    id: 185, section: "Chemical Pathology", number: 17,
    text: "What is the calculated non-HDL cholesterol for a patient with Total cholesterol= 6.2 mmol/L, triglycerides=1.8 mmol/L, HDL-cholesterol= 1.1 mmol/L?",
    options: [
      { label: "A", text: "5.1 mmol/L" },
      { label: "B", text: "4.4 mmol/L" },
      { label: "C", text: "7.3 mmol/L" },
      { label: "D", text: "2.9 mmol/L" },
    ], correct: "A",
  },
  {
    id: 186, section: "Chemical Pathology", number: 18,
    text: "Which of the following correctly describes the low-density lipoprotein (LDL) molecule?",
    options: [
      { label: "A", text: "It is the primary vehicle for delivering cholesterol to peripheral tissues" },
      { label: "B", text: "It protects against heart disease" },
      { label: "C", text: "It is elevated by regular exercise" },
      { label: "D", text: "It is the primary vehicle for removing cholesterol from peripheral tissues" },
    ], correct: "A",
  },
  {
    id: 187, section: "Chemical Pathology", number: 19,
    text: "Which of the following is NOT involved in the elevation of serum homocysteine?",
    options: [
      { label: "A", text: "Vitamin deficiencies" },
      { label: "B", text: "Smoking" },
      { label: "C", text: "Heart muscle injury" },
      { label: "D", text: "Genetic defects" },
    ], correct: "C",
  },
  {
    id: 188, section: "Chemical Pathology", number: 20,
    text: "Which of the following may cause the elevation of fibrinogen levels?",
    options: [
      { label: "A", text: "Hypothyroidism" },
      { label: "B", text: "Vitamin C" },
      { label: "C", text: "High cholesterol levels" },
      { label: "D", text: "Methotrexate" },
    ], correct: "A",
  },
  {
    id: 189, section: "Chemical Pathology", number: 21,
    text: "Measurement of serum myoglobin is NOT very useful for ruling out MI because:",
    options: [
      { label: "A", text: "Levels rise and fall too rapidly (<12 hrs) and is not useful for individuals who appear late" },
      { label: "B", text: "It is present in too low concentrations" },
      { label: "C", text: "There are no specific assays to measure myoglobin" },
      { label: "D", text: "Sample has to be taken under fasting conditions for accuracy" },
    ], correct: "A",
  },
  {
    id: 190, section: "Chemical Pathology", number: 22,
    text: "A 36-year-old woman with high levels of LDL suffered myocardial infarction at age 25 and has a family history of early MI. Which of the following factors must be contributing to her condition?",
    options: [
      { label: "A", text: "Defective LDL receptor and Inadequate hepatic LDL uptake only" },
      { label: "B", text: "Defective LDL receptor and Inadequate peripheral uptake of LDL only" },
      { label: "C", text: "Defective LDL receptor, Inadequate hepatic LDL uptake and Inadequate peripheral uptake of LDL" },
      { label: "D", text: "Inadequate hepatic LDL uptake and Inadequate peripheral uptake of LDL only" },
    ], correct: "C",
  },
  {
    id: 191, section: "Chemical Pathology", number: 23,
    text: "Which of the following best describes the clinical sensitivity and specificity of cardiac markers for AMI?",
    options: [
      { label: "A", text: "Myoglobin has the highest sensitivity and troponin the highest specificity" },
      { label: "B", text: "Cardiac troponin has the highest sensitivity and specificity" },
      { label: "C", text: "Cardiac troponin has the highest sensitivity, and CK-MB the highest specificity" },
      { label: "D", text: "CK-MB has the highest sensitivity and cardiac troponin the highest specificity" },
    ], correct: "B",
  },
  {
    id: 192, section: "Chemical Pathology", number: 24,
    text: "Which of the following is NOT true of lipoprotein lipase deficiency?",
    options: [
      { label: "A", text: "The primary defect may be deficiency of lipoprotein lipase" },
      { label: "B", text: "It is a sex-linked disorder" },
      { label: "C", text: "The primary defect may be deficiency of apo C-II" },
      { label: "D", text: "Acute pancreatitis is increased" },
    ], correct: "B",
  },
  {
    id: 193, section: "Chemical Pathology", number: 25,
    text: "Homocysteine is implicated directly in vascular injury including the following EXCEPT:",
    options: [
      { label: "A", text: "Platelet aggregation" },
      { label: "B", text: "Inhibition of lipoprotein lipase" },
      { label: "C", text: "Foam cell formation" },
      { label: "D", text: "Disruption of elastic lamina" },
    ], correct: "B",
  },
  {
    id: 194, section: "Chemical Pathology", number: 26,
    text: "After a meal, the bloodstream transports chylomicrons to all tissues of the body. The principal site of uptake is:",
    options: [
      { label: "A", text: "Kidney" },
      { label: "B", text: "Liver" },
      { label: "C", text: "Adipose tissue" },
      { label: "D", text: "Intestine" },
    ], correct: "C",
  },
  {
    id: 195, section: "Chemical Pathology", number: 27,
    text: "A serum Troponin T concentration is of most value to the patient with a myocardial infarction when:",
    options: [
      { label: "A", text: "CK-MB has already peaked and returned to normal concentrations" },
      { label: "B", text: "Onset of symptoms is within 3 to 6 hours of the sample being drawn" },
      { label: "C", text: "Troponin I concentration has returned to normal concentrations" },
      { label: "D", text: "Myoglobin concentration is extremely elevated" },
    ], correct: "A",
  },
];

const SURG: PQQuestion[] = [
  {
    id: 196, section: "Surgery", number: 1,
    text: "Following the revascularization of a patient with an acute limb ischaemia, which of the following biochemical derangements is expected to be present?",
    options: [
      { label: "A", text: "Hypermagnesaemia" },
      { label: "B", text: "Hypernatraemia" },
      { label: "C", text: "Hypophosphataemia" },
      { label: "D", text: "Hyperkalemia" },
    ], correct: "D",
  },
  {
    id: 197, section: "Surgery", number: 2,
    text: "Acute deep vein thrombosis appears as:",
    options: [
      { label: "A", text: "Hypoechoic / Anechoic" },
      { label: "B", text: "Echogenic" },
      { label: "C", text: "Heterogeneous" },
      { label: "D", text: "Isoechoic" },
    ], correct: "A",
  },
  {
    id: 198, section: "Surgery", number: 3,
    text: "In a patient with an Aorto-iliac disease with a significant obstruction just proximal to the bifurcation, which of the following will be the correct surgical management?",
    options: [
      { label: "A", text: "Balloon angioplasty and femoro-femoral bypass" },
      { label: "B", text: "An aorto-bifemoral bypass" },
      { label: "C", text: "An Aorto-popliteal bypass to the limb that is most affected" },
      { label: "D", text: "A balloon angioplasty of the iliac vessel with stenting of both iliac arteries" },
    ], correct: "B",
  },
  {
    id: 199, section: "Surgery", number: 4,
    text: "In differentiating vasculogenic from neurogenic claudication, which of the statements below is correct?",
    options: [
      { label: "A", text: "Neurogenic claudication is caused by ischaemia due to excessive stimulation of motor nerves to peripheral vessels" },
      { label: "B", text: "Vasculogenic claudication progresses even after exercise has stopped" },
      { label: "C", text: "Neurogenic claudication is unpredictable and cannot be reproduced on the treadmill" },
      { label: "D", text: "Vasculogenic claudication affects muscles proximal to the obstruction" },
    ], correct: "D",
  },
  {
    id: 200, section: "Surgery", number: 5,
    text: "A 54-year-old man who is a chain smoker presents to the emergency room with a sudden onset of severe pain in his left foot. Prior to this, he had pain involving his left buttock, thigh and calf any time he walks briskly. Which of the following will be the most appropriate initial treatment?",
    options: [
      { label: "A", text: "Start urgent fluid resuscitation and narcotic analgesia" },
      { label: "B", text: "Start him on antiplatelets and put on strict bed rest" },
      { label: "C", text: "Give urgent broad-spectrum antibiotics and narcotic analgesia" },
      { label: "D", text: "Initiate an urgent exercise program and stop smoking" },
    ], correct: "A",
  },
  {
    id: 201, section: "Surgery", number: 6,
    text: "The following are features of venous doppler ultrasound scan except:",
    options: [
      { label: "A", text: "Compressibility" },
      { label: "B", text: "Venous flow is triphasic" },
      { label: "C", text: "Venous flow fluctuates with respiration" },
      { label: "D", text: "Venous flow augments with distal compression of the calf" },
    ], correct: "B",
  },
  {
    id: 202, section: "Surgery", number: 7,
    text: "In an elderly patient with a peripheral vascular disease requiring a bypass surgery, which of these statements is TRUE?",
    options: [
      { label: "A", text: "The most common postoperative cause of mortality is cardiac" },
      { label: "B", text: "A normal ECG would be sufficient for cardiac assessment" },
      { label: "C", text: "In a patient who has no history of smoking there is no need for pulmonary function test" },
      { label: "D", text: "The vital capacity of the pulmonary test is the most important parameter in assessing lung function" },
    ], correct: "A",
  },
  {
    id: 203, section: "Surgery", number: 8,
    text: "Which of the following represents a fibrous clot present in the circulation due to being sheared from a fixed clot somewhere else in the body?",
    options: [
      { label: "A", text: "Thrombus" },
      { label: "B", text: "Plaque" },
      { label: "C", text: "Thrombophlebitis" },
      { label: "D", text: "Embolus" },
    ], correct: "D",
  },
  {
    id: 204, section: "Surgery", number: 9,
    text: "Which of the following statements concerning intermittent claudications in a patient with PVD is correct?",
    options: [
      { label: "A", text: "The claudication distance has been shown to double in 6 months on conservative management" },
      { label: "B", text: "It is associated with rest pain when the patient is lying recumbent with foot raised" },
      { label: "C", text: "They all end up requiring amputation" },
      { label: "D", text: "Lifestyle modification has no impact on its natural history once it occurs" },
    ], correct: "A",
  },
  {
    id: 205, section: "Surgery", number: 10,
    text: "A 56-year-old man is to perform a bypass surgery for peripheral vascular disease and intermittent claudication. A decision to perform a bypass surgery will be based on:",
    options: [
      { label: "A", text: "Ankle brachial index" },
      { label: "B", text: "MRI scan" },
      { label: "C", text: "Cardiac function test" },
      { label: "D", text: "Coagulation profile" },
    ], correct: "A",
  },
  {
    id: 206, section: "Surgery", number: 11,
    text: "The following are true concerning colour Doppler EXCEPT:",
    options: [
      { label: "A", text: "It shows the type of vessel" },
      { label: "B", text: "It shows direction of flow" },
      { label: "C", text: "It shows velocity of flow" },
      { label: "D", text: "It can differentiate acute and chronic DVT" },
    ], correct: "D",
  },
  {
    id: 207, section: "Surgery", number: 12,
    text: "Which of the following investigations will be appropriate in diagnosing the point of obstruction in a patient who presents with an acute limb ischaemia?",
    options: [
      { label: "A", text: "Ankle brachial index" },
      { label: "B", text: "Arterial Angiography" },
      { label: "C", text: "Venous duplex doppler" },
      { label: "D", text: "MRI scan" },
    ], correct: "B",
  },
  {
    id: 208, section: "Surgery", number: 13,
    text: "The imaging modality of choice for deep vein thrombosis is:",
    options: [
      { label: "A", text: "Arteriography" },
      { label: "B", text: "Arterial doppler ultrasound scan" },
      { label: "C", text: "Venography" },
      { label: "D", text: "Venous doppler ultrasound scan" },
    ], correct: "D",
  },
  {
    id: 209, section: "Surgery", number: 14,
    text: "Which of the following diseases may coexist with peripheral vascular diseases?",
    options: [
      { label: "A", text: "Carotid artery stenosis" },
      { label: "B", text: "Varicose veins" },
      { label: "C", text: "Chronic occlusive pulmonary disease" },
      { label: "D", text: "Cardiomyopathies" },
    ], correct: "A",
  },
  {
    id: 210, section: "Surgery", number: 15,
    text: "A 56-year-old man who is a chain smoker and diabetic presents to the emergency room with a sudden onset of severe pain in his left foot. He had a prior history of intermittent claudication with shortening claudication distance. Which of the following investigations or bedside assessments will be an indication for revascularization?",
    options: [
      { label: "A", text: "High blood potassium levels" },
      { label: "B", text: "An ankle-brachial index of 0.6" },
      { label: "C", text: "A cold limb with fixed staining" },
      { label: "D", text: "High blood lactate levels" },
    ], correct: "D",
  },
  {
    id: 211, section: "Surgery", number: 16,
    text: "Which of the following statements correctly describes any of the features of intermittent claudication?",
    options: [
      { label: "A", text: "The amount of exercise that causes the pain is predictable" },
      { label: "B", text: "The patient prefers lying down with limb elevated" },
      { label: "C", text: "The patient has rest pain" },
      { label: "D", text: "When the cramps occur, the pain is felt from the buttocks to the thigh and then the calves" },
    ], correct: "A",
  },
  {
    id: 212, section: "Surgery", number: 17,
    text: "A 56-year-old man with a 20-pack year of smoking presents with a sudden onset of severe pain in his right foot. Examination demonstrates an obvious large pulsatile mass in the femoral triangle. Which of the following statements is correct?",
    options: [
      { label: "A", text: "The pulsating mass may be the point of obstruction" },
      { label: "B", text: "The pulsating mass is irrelevant and just a red herring" },
      { label: "C", text: "The most likely cause is a thrombus" },
      { label: "D", text: "The pulsating mass may be the source of obstruction" },
    ], correct: "D",
  },
  {
    id: 213, section: "Surgery", number: 18,
    text: "Which of the following is a risk factor for developing an acute limb ischaemia?",
    options: [
      { label: "A", text: "Hypertension" },
      { label: "B", text: "Diabetes Mellitus" },
      { label: "C", text: "Cardiac arrhythmia" },
      { label: "D", text: "Severe dehydration" },
    ], correct: "C",
  },
  {
    id: 214, section: "Surgery", number: 19,
    text: "Which of the following is NOT a clinical feature of a critical limb ischaemia?",
    options: [
      { label: "A", text: "A weak thready peripheral pulse" },
      { label: "B", text: "Loss of function" },
      { label: "C", text: "Pallor" },
      { label: "D", text: "Rest pain" },
    ], correct: "A",
  },
  {
    id: 215, section: "Surgery", number: 20,
    text: "Which of the following statements is correct concerning intermittent claudication?",
    options: [
      { label: "A", text: "Urgent revascularization is always required" },
      { label: "B", text: "The best treatment is to put the patient on strict bed rest" },
      { label: "C", text: "When it involves the buttocks, it may also cause impotence in men (Leriche Syndrome)" },
      { label: "D", text: "It is felt in the thighs more commonly than in the calf" },
    ], correct: "C",
  },
  {
    id: 216, section: "Surgery", number: 21,
    text: "A 15-year-old boy complains of pain in his legs when he runs more than 300 m. His blood pressure is 165/90 mm Hg. The radial pulses are 4+, and the dorsalis pedis pulses are 1+. Arterial blood gas measurement shows a normal oxygen saturation level. Which of the following lesions is most likely to be present?",
    options: [
      { label: "A", text: "Tricuspid atresia" },
      { label: "B", text: "Patent ductus arteriosus" },
      { label: "C", text: "Aortic valve stenosis" },
      { label: "D", text: "Coarctation of the aorta" },
    ], correct: "D",
  },
];

const ANAT: PQQuestion[] = [
  {
    id: 217, section: "Anatomy & Radiology", number: 1,
    text: "The chest radiograph showing pericardial effusion is consistent with which of the following?",
    options: [
      { label: "A", text: "Tricuspid stenosis" },
      { label: "B", text: "Mitral stenosis" },
      { label: "C", text: "Pulmonary hypertension" },
      { label: "D", text: "Pericardial effusion" },
    ], correct: "D",
  },
  {
    id: 218, section: "Anatomy & Radiology", number: 2,
    text: "A chest radiograph showing a figure-of-3 sign or rib notching is suggestive of:",
    options: [
      { label: "A", text: "Dilated oesophagus" },
      { label: "B", text: "Aortic Coarctation" },
      { label: "C", text: "Dilated left ventricle" },
      { label: "D", text: "Aortic aneurysm" },
    ], correct: "B",
  },
  {
    id: 219, section: "Anatomy & Radiology", number: 3,
    text: "On a standard PA chest radiograph, the structure labelled as the 'aortic knuckle' is:",
    options: [
      { label: "A", text: "Aortic knuckle" },
      { label: "B", text: "Inferior vena cava" },
      { label: "C", text: "Left atrium" },
      { label: "D", text: "Right ventricle" },
    ], correct: "A",
  },
  {
    id: 220, section: "Anatomy & Radiology", number: 4,
    text: "On a standard chest radiograph, a structure that contributes to the right lower heart border is:",
    options: [
      { label: "A", text: "Right ventricle" },
      { label: "B", text: "Lung" },
      { label: "C", text: "Right atrium" },
      { label: "D", text: "IVC" },
    ], correct: "C",
  },
  {
    id: 221, section: "Anatomy & Radiology", number: 5,
    text: "On a chest radiograph, all the following are true EXCEPT:",
    options: [
      { label: "A", text: "The pulmonary artery is normal" },
      { label: "B", text: "The heart is normal size" },
      { label: "C", text: "The heart is enlarged" },
      { label: "D", text: "The descending aorta is normal" },
    ], correct: "B",
  },
  {
    id: 222, section: "Anatomy & Radiology", number: 6,
    text: "The base of the heart is formed by:",
    options: [
      { label: "A", text: "Left atrium" },
      { label: "B", text: "Diaphragm" },
      { label: "C", text: "Right atrium" },
      { label: "D", text: "Right ventricle" },
    ], correct: "A",
  },
  {
    id: 223, section: "Anatomy & Radiology", number: 7,
    text: "The upper left heart border is formed by the:",
    options: [
      { label: "A", text: "Left apex" },
      { label: "B", text: "Thoracic aorta (Aortic Knob)" },
      { label: "C", text: "Left atrial appendage" },
      { label: "D", text: "Pulmonary artery" },
    ], correct: "D",
  },
  {
    id: 224, section: "Anatomy & Radiology", number: 8,
    text: "The structure labelled as 6 on a chest radiograph (inferior right heart border) is:",
    options: [
      { label: "A", text: "Right atrium" },
      { label: "B", text: "Left atrial appendage" },
      { label: "C", text: "Right ventricle" },
      { label: "D", text: "Inferior vena cava" },
    ], correct: "D",
  },
  {
    id: 225, section: "Anatomy & Radiology", number: 9,
    text: "The structure labelled as 5 on a chest radiograph (upper left border below the aortic knuckle) is:",
    options: [
      { label: "A", text: "Left atrium" },
      { label: "B", text: "Aortopulmonary window" },
      { label: "C", text: "Left pulmonary artery" },
      { label: "D", text: "Right ventricle" },
    ], correct: "C",
  },
  {
    id: 226, section: "Anatomy & Radiology", number: 10,
    text: "The following may cause widening of the mediastinum EXCEPT:",
    options: [
      { label: "A", text: "Aortic Coarctation" },
      { label: "B", text: "Aortic dissection" },
      { label: "C", text: "Dilated oesophagus" },
      { label: "D", text: "Aortic aneurysm" },
    ], correct: "A",
  },
  {
    id: 227, section: "Anatomy & Radiology", number: 11,
    text: "The apex of the heart is formed by:",
    options: [
      { label: "A", text: "Left ventricle" },
      { label: "B", text: "Left atrium" },
      { label: "C", text: "Right atrium" },
      { label: "D", text: "Right ventricle" },
    ], correct: "A",
  },
  {
    id: 228, section: "Anatomy & Radiology", number: 12,
    text: "The right heart border is formed by:",
    options: [
      { label: "A", text: "Inferior vena cava" },
      { label: "B", text: "Right atrium" },
      { label: "C", text: "Right ventricle" },
      { label: "D", text: "Superior vena cava" },
    ], correct: "B",
  },
  {
    id: 229, section: "Anatomy & Radiology", number: 13,
    text: "The following are branches of the aortic arch EXCEPT:",
    options: [
      { label: "A", text: "Left subclavian artery" },
      { label: "B", text: "Left common carotid artery" },
      { label: "C", text: "Right common carotid artery" },
      { label: "D", text: "Brachiocephalic artery" },
    ], correct: "C",
  },
  {
    id: 230, section: "Anatomy & Radiology", number: 14,
    text: "On a chest radiograph, the structure labelled B in the right lower heart border is:",
    options: [
      { label: "A", text: "Inferior vena cava" },
      { label: "B", text: "Left atrium" },
      { label: "C", text: "Right atrium" },
      { label: "D", text: "Right ventricle" },
    ], correct: "C",
  },
  {
    id: 231, section: "Anatomy & Radiology", number: 15,
    text: "Mitral valve stenosis causes:",
    options: [
      { label: "A", text: "Pulmonary artery hypertension / Left atrial dilatation" },
      { label: "B", text: "Left ventricular dilatation" },
      { label: "C", text: "Pulmonary venous hypertension" },
      { label: "D", text: "Aortic aneurysm" },
    ], correct: "A",
  },
  {
    id: 232, section: "Anatomy & Radiology", number: 16,
    text: "Using the chest radiograph, if the distance AB is 4cm and CD is 8.2cm (cardiothoracic ratio approximately 0.48), which statement is correct?",
    options: [
      { label: "A", text: "The heart is enlarged" },
      { label: "B", text: "The mediastinum is enlarged" },
      { label: "C", text: "The heart is normal in size" },
      { label: "D", text: "The heart shows evidence of hypertension" },
    ], correct: "C",
  },
  {
    id: 233, section: "Anatomy & Radiology", number: 17,
    text: "On a chest radiograph, the structure labelled C in the right heart border is:",
    options: [
      { label: "A", text: "Right atrium" },
      { label: "B", text: "Right ventricle" },
      { label: "C", text: "Inferior vena cava" },
      { label: "D", text: "Left atrium" },
    ], correct: "A",
  },
  {
    id: 234, section: "Anatomy & Radiology", number: 18,
    text: "The structure labelled E on a chest radiograph (left heart border, lower portion) is:",
    options: [
      { label: "A", text: "Left atrial appendage" },
      { label: "B", text: "Aorta" },
      { label: "C", text: "Lung" },
      { label: "D", text: "Left ventricle" },
    ], correct: "D",
  },
  {
    id: 235, section: "Anatomy & Radiology", number: 19,
    text: "Which of the following will cause a double right heart border on a chest radiograph?",
    options: [
      { label: "A", text: "Tricuspid stenosis" },
      { label: "B", text: "Mitral stenosis" },
      { label: "C", text: "Pulmonary stenosis" },
      { label: "D", text: "Pulmonary hypertension" },
    ], correct: "B",
  },
  {
    id: 236, section: "Anatomy & Radiology", number: 20,
    text: "Which of the following vasculitis is ANCA mediated?",
    options: [
      { label: "A", text: "Takayasu disease" },
      { label: "B", text: "Henoch-Schonlein purpura" },
      { label: "C", text: "Churg-Strauss syndrome" },
      { label: "D", text: "Wegener granulomatosis" },
    ], correct: "D",
  },
  {
    id: 237, section: "Anatomy & Radiology", number: 21,
    text: "The structure labelled G (at the top of the mediastinum/arch region) on a chest radiograph is:",
    options: [
      { label: "A", text: "Trachea" },
      { label: "B", text: "Pulmonary trunk" },
      { label: "C", text: "Aortic arch" },
      { label: "D", text: "Oesophagus" },
    ], correct: "C",
  },
  {
    id: 238, section: "Anatomy & Radiology", number: 22,
    text: "The structure labelled F on a chest radiograph (left lower heart border) is:",
    options: [
      { label: "A", text: "Diaphragm" },
      { label: "B", text: "Left ventricle" },
      { label: "C", text: "Aorta" },
      { label: "D", text: "Left atrium" },
    ], correct: "B",
  },
  {
    id: 239, section: "Anatomy & Radiology", number: 23,
    text: "The structure labelled A on a chest radiograph (upper left border) is:",
    options: [
      { label: "A", text: "Pulmonary artery" },
      { label: "B", text: "Right atrium" },
      { label: "C", text: "Superior vena cava" },
      { label: "D", text: "Descending aorta" },
    ], correct: "A",
  },
  {
    id: 240, section: "Anatomy & Radiology", number: 24,
    text: "The structure labelled H (pointing to the midline trachea) on a chest radiograph is:",
    options: [
      { label: "A", text: "Aortic arch" },
      { label: "B", text: "Pulmonary trunk" },
      { label: "C", text: "Trachea" },
      { label: "D", text: "Oesophagus" },
    ], correct: "C",
  },
  {
    id: 241, section: "Anatomy & Radiology", number: 25,
    text: "The following structures are found at the hilum of the lung EXCEPT:",
    options: [
      { label: "A", text: "Pulmonary veins" },
      { label: "B", text: "Lymph nodes" },
      { label: "C", text: "Aorta" },
      { label: "D", text: "Nerves" },
    ], correct: "C",
  },
  {
    id: 242, section: "Anatomy & Radiology", number: 26,
    text: "The brachiocephalic vein is formed by:",
    options: [
      { label: "A", text: "Internal jugular veins" },
      { label: "B", text: "Internal jugular vein and axillary vein" },
      { label: "C", text: "Subclavian vein and axillary vein" },
      { label: "D", text: "Subclavian vein and internal jugular vein" },
    ], correct: "D",
  },
  {
    id: 243, section: "Anatomy & Radiology", number: 27,
    text: "The following are true about the mediastinum EXCEPT:",
    options: [
      { label: "A", text: "Dilated oesophagus may show opacity beyond the clavicle on chest radiograph" },
      { label: "B", text: "Enlarged mediastinum is always due to aortic disease" },
      { label: "C", text: "Posterior mediastinum contains lymph nodes" },
      { label: "D", text: "The aorta is found in the posterior mediastinum" },
    ], correct: "B",
  },
  {
    id: 244, section: "Anatomy & Radiology", number: 28,
    text: "All the following vasculitis diseases are rare based on their classification EXCEPT:",
    options: [
      { label: "A", text: "Kawasaki" },
      { label: "B", text: "Takayasu" },
      { label: "C", text: "PAN (classic)" },
      { label: "D", text: "Thromboangiitis obliterans" },
    ], correct: "A",
  },
];

export const ALL_CARDIOVASCULAR2_QUESTIONS: PQQuestion[] = [
  ...IM,
  ...PHARM,
  ...PATH,
  ...CHEM,
  ...SURG,
  ...ANAT,
];

export const CARDIOVASCULAR2_SECTIONS = [
  {
    name: "Internal Medicine",
    count: IM.length,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    name: "Pharmacology",
    count: PHARM.length,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    name: "Pathology",
    count: PATH.length,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    name: "Chemical Pathology",
    count: CHEM.length,
    color: "text-fuchsia-700",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
  },
  {
    name: "Surgery",
    count: SURG.length,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    name: "Anatomy & Radiology",
    count: ANAT.length,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];
