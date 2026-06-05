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
    text: "Which statement best describes the differences between the characteristics of type 1 and type 2 diabetes?",
    options: [
      { label: "A", text: "Persons with type 1 diabetes can increase endogenous insulin production by taking oral hypoglycemic agents" },
      { label: "B", text: "Persons with type 1 diabetes rapidly develop chronic complications" },
      { label: "C", text: "Persons with type 2 diabetes usually require lower doses of insulin than persons with type 1 diabetes because they have a milder form of diabetes" },
      { label: "D", text: "Autoimmune factors are involved in the pathogenesis of type 1 but not type 2 diabetes" },
    ], correct: "D",
  },
  {
    id: 2, section: "Internal Medicine", number: 2,
    text: "In thyrotoxicosis, there is:",
    options: [
      { label: "A", text: "Decrease in calcium excretion" },
      { label: "B", text: "Potentiation of catecholamine action" },
      { label: "C", text: "Increase in serum proteins which bind thyroxine" },
      { label: "D", text: "Increase in calcium excretion" },
    ], correct: "B",
  },
  {
    id: 3, section: "Internal Medicine", number: 3,
    text: "A patient presents with tachycardia and heat intolerance and is suspected of Graves' disease. Which of the following is NOT a characteristic feature of Grave's disease?",
    options: [
      { label: "A", text: "Increased total and free T4" },
      { label: "B", text: "Exophthalmos" },
      { label: "C", text: "Suppressed plasma TSH" },
      { label: "D", text: "Decreased thyroid radioactive iodine uptake" },
    ], correct: "D",
  },
  {
    id: 4, section: "Internal Medicine", number: 4,
    text: "Considering the etiology of hyperparathyroidism, which of the following is correct?",
    options: [
      { label: "A", text: "Iodation of salt will reduce the prevalence of hyperparathyroidism in the community" },
      { label: "B", text: "A high amount of fluoride in ground water may predispose a person to developing hyperthyroidism" },
      { label: "C", text: "Chronic high serum lithium is a known cause of hyperparathyroidism" },
      { label: "D", text: "Poor management of patients on dialysis may cause primary hyperthyroidism" },
    ], correct: "C",
  },
  {
    id: 5, section: "Internal Medicine", number: 5,
    text: "Which of the following conditions may cause secondary hyperparathyroidism?",
    options: [
      { label: "A", text: "Iodine deficiency" },
      { label: "B", text: "Vitamin D deficiency" },
      { label: "C", text: "Amyloidosis" },
      { label: "D", text: "Multiple endocrine neoplasm type 1 (MEN1)" },
    ], correct: "B",
  },
  {
    id: 6, section: "Internal Medicine", number: 6,
    text: "Which of the following is a clinical feature of hyperparathyroidism?",
    options: [
      { label: "A", text: "Epigastric pain" },
      { label: "B", text: "Polyphagia" },
      { label: "C", text: "Odynophagia" },
      { label: "D", text: "Oliguria" },
    ], correct: "A",
  },
  {
    id: 7, section: "Internal Medicine", number: 7,
    text: "A 52-year-old woman who has a long-standing goiter had a flu-like illness 3 days prior to presenting to the clinic with a painful neck mass with fever and chills. The neck mass was tender on palpation. Which of the following is the most likely diagnosis?",
    options: [
      { label: "A", text: "Hurtle cell thyroiditis" },
      { label: "B", text: "Riedel's Thyroiditis" },
      { label: "C", text: "Sub-acute thyroiditis" },
      { label: "D", text: "Hashimoto thyroiditis" },
    ], correct: "C",
  },
  {
    id: 8, section: "Internal Medicine", number: 8,
    text: "Patients with Graves' disease have high circulating levels of thyroid hormones. Graves' disease is characterised by the following, EXCEPT:",
    options: [
      { label: "A", text: "Hyperactivation of TSH receptor in thyroid glands" },
      { label: "B", text: "Excess release of TSH from the anterior pituitary" },
      { label: "C", text: "Presence of TSH receptor antibodies causing receptor activation" },
      { label: "D", text: "Decreased TSH levels" },
    ], correct: "B",
  },
  {
    id: 9, section: "Internal Medicine", number: 9,
    text: "Which of the following are most likely present in a patient with Conn's syndrome (hyperaldosteronism)?",
    options: [
      { label: "A", text: "Hypotension" },
      { label: "B", text: "Hyponatremia" },
      { label: "C", text: "Hypertension" },
      { label: "D", text: "Hyperkalemia" },
    ], correct: "C",
  },
  {
    id: 10, section: "Internal Medicine", number: 10,
    text: "Physical examination of a patient with low blood concentrations of sodium and chloride compared with potassium ions revealed hyperpigmentation of both exposed and unexposed parts of the body. The hyperpigmentation was as a result of:",
    options: [
      { label: "A", text: "Increased secretion of aldosterone" },
      { label: "B", text: "Increased secretion of growth hormone" },
      { label: "C", text: "Increased secretion of parathyroid hormone" },
      { label: "D", text: "Increased secretion of cortisol" },
    ], correct: "D",
  },
  {
    id: 11, section: "Internal Medicine", number: 11,
    text: "Which of the following is NOT a feature of Hypothyroidism?",
    options: [
      { label: "A", text: "Cold intolerance" },
      { label: "B", text: "Weight gain" },
      { label: "C", text: "Angina and heart failure" },
      { label: "D", text: "Subfertility" },
    ], correct: "C",
  },
  {
    id: 12, section: "Internal Medicine", number: 12,
    text: "A 36-year-old young man with a history of chronic renal disease on dialysis complains of fatigue and lethargy and pain in the upper part of his right leg. An x-ray of the tibia and fibula show he had a bone cyst and sub-periosteal resorption. Which of the following will be an appropriate treatment?",
    options: [
      { label: "A", text: "Aspirate the cyst for cytology" },
      { label: "B", text: "Reduce the number of dialysis per week" },
      { label: "C", text: "Give strong analgesia" },
      { label: "D", text: "Give pulses of calcitriol" },
    ], correct: "D",
  },
  {
    id: 13, section: "Internal Medicine", number: 13,
    text: "Following the initiation of thyroid replacement therapy in a patient with primary hypothyroidism, which of the following laboratory changes should NOT be expected?",
    options: [
      { label: "A", text: "fT3 should decrease" },
      { label: "B", text: "TSH should decrease" },
      { label: "C", text: "fT4 should increase" },
      { label: "D", text: "Normal creatine kinase level" },
    ], correct: "A",
  },
  {
    id: 14, section: "Internal Medicine", number: 14,
    text: "Iodine deficiency used to be a common cause of thyroid enlargement (goiter) in some parts of the world. Which abnormality in chronically iodine-deficient patients is most directly related to the enlargement of the thyroid gland?",
    options: [
      { label: "A", text: "Impaired conversion of T4 to T3" },
      { label: "B", text: "Elevated TSH level" },
      { label: "C", text: "Reduced activity of thyroperoxidase" },
      { label: "D", text: "An antibody that binds to the TSH receptor in the thyroid gland" },
    ], correct: "B",
  },
  {
    id: 15, section: "Internal Medicine", number: 15,
    text: "A patient presented to the endocrine clinic with a diffusely enlarged thyroid mass with wide staring gaze. The patient has a lid lag and pretibial myxedema. Which of the following cluster of presentation is likely to be seen in this patient?",
    options: [
      { label: "A", text: "Hyperpigmentation, weakness, hypertension" },
      { label: "B", text: "Nervousness, irritability, paresthesia, tetany" },
      { label: "C", text: "Tremor, tachycardia, weight loss" },
      { label: "D", text: "Dry skin, hypertension, and fatigability" },
    ], correct: "C",
  },
  {
    id: 16, section: "Internal Medicine", number: 16,
    text: "Which of the following is true about secondary hyperparathyroidism?",
    options: [
      { label: "A", text: "Patients are generally hypocalcemic" },
      { label: "B", text: "Commonly occurs in CRF" },
      { label: "C", text: "Related to hyperphosphatemia" },
      { label: "D", text: "All of the other options" },
    ], correct: "D",
  },
  {
    id: 17, section: "Internal Medicine", number: 17,
    text: "Prediabetes is the term used for individuals that do not meet the criteria for diabetes but are too high to be considered normal. Which of the following statements accurately characterize prediabetes?",
    options: [
      { label: "A", text: "Fasting blood glucose from 7.0–7.7 mmol/L" },
      { label: "B", text: "Fasting blood glucose from 5.6–7.8 mmol/L" },
      { label: "C", text: "Fasting blood glucose from 6.6–10 mmol/L" },
      { label: "D", text: "Fasting blood glucose from 6.1–6.9 mmol/L" },
    ], correct: "D",
  },
  {
    id: 18, section: "Internal Medicine", number: 18,
    text: "A 40-year-old woman complains of chronic constipation and anovulatory menstrual cycles for the last 8 months. She also alluded to forgetfulness, and tiredness. Physical examination reveals peripheral non-pitting edema and a firm, diffusely enlarged thyroid gland. What is the appropriate diagnosis?",
    options: [
      { label: "A", text: "Subacute (de Quervain) thyroiditis" },
      { label: "B", text: "Hashimoto's thyroiditis" },
      { label: "C", text: "Lymphadenoid thyroiditis" },
      { label: "D", text: "Graves' disease" },
    ], correct: "B",
  },
  {
    id: 19, section: "Internal Medicine", number: 19,
    text: "A 42-year-old woman with no significant previous medical history presents to the OPD with a fracture of her forearm from a rather innocuous fall. She is hypertensive and with a recent history of polyuria and polydipsia and a radiologically confirmed ureteric stone. Which of the following statements about the patient is the most appropriate?",
    options: [
      { label: "A", text: "Her serum vitamin D level should be very high" },
      { label: "B", text: "Her parathyroid hormone level is expected to be low and calcium level high" },
      { label: "C", text: "Her parathyroid hormone level will be high and blood calcium level should be high" },
      { label: "D", text: "It is necessary to rule out pheochromocytoma" },
    ], correct: "C",
  },
  {
    id: 20, section: "Internal Medicine", number: 20,
    text: "In which of the following pathologies will an assay of microsomal antibodies be indicated?",
    options: [
      { label: "A", text: "Sub-acute thyroiditis" },
      { label: "B", text: "Grave's disease" },
      { label: "C", text: "Hashimoto thyroiditis" },
      { label: "D", text: "Medullary Cancer of the thyroid gland" },
    ], correct: "C",
  },
  {
    id: 21, section: "Internal Medicine", number: 21,
    text: "Which of the following statements is correct?",
    options: [
      { label: "A", text: "The rise in insulin concentration after meal ingestion is reduced in type 1 but not in type 2 diabetes" },
      { label: "B", text: "Insulin mediates glucose uptake in the brain" },
      { label: "C", text: "\"Prediabetes\" is a condition characterized by an increased risk for the future development of type 2 diabetes" },
      { label: "D", text: "Insulin suppresses the activity of glycogen synthase" },
    ], correct: "C",
  },
  {
    id: 22, section: "Internal Medicine", number: 22,
    text: "A patient presents with signs of hypothyroidism. The measurements of the level of serum T4 and TSH were done. If the patient suffers from iodine deficiency, the following results are expected:",
    options: [
      { label: "A", text: "T4 reduced, TSH normal" },
      { label: "B", text: "T4 elevated, TSH reduced" },
      { label: "C", text: "T4 reduced, TSH elevated" },
      { label: "D", text: "T4 reduced, TSH reduced" },
    ], correct: "C",
  },
  {
    id: 23, section: "Internal Medicine", number: 23,
    text: "Hyperparathyroidism is characterized by the following EXCEPT:",
    options: [
      { label: "A", text: "Renal calculi" },
      { label: "B", text: "Osteosclerosis" },
      { label: "C", text: "Hypercalcemia" },
      { label: "D", text: "Generalized osteoporosis" },
    ], correct: "B",
  },
  {
    id: 24, section: "Internal Medicine", number: 24,
    text: "In males, long-term relatively specific effects of diabetes include development of the following EXCEPT:",
    options: [
      { label: "A", text: "Neuropathy" },
      { label: "B", text: "Prostatitis" },
      { label: "C", text: "Retinopathy" },
      { label: "D", text: "Nephropathy" },
    ], correct: "B",
  },
  {
    id: 25, section: "Internal Medicine", number: 25,
    text: "All are seen in Cushing's syndrome EXCEPT:",
    options: [
      { label: "A", text: "Hypertension" },
      { label: "B", text: "Hypoglycemia" },
      { label: "C", text: "Truncal obesity" },
      { label: "D", text: "Poor wound healing" },
    ], correct: "B",
  },
  {
    id: 26, section: "Internal Medicine", number: 26,
    text: "All the following statements are correct regarding hyperprolactinemia EXCEPT:",
    options: [
      { label: "A", text: "Increased Dopamine Secretion" },
      { label: "B", text: "It causes failure to ovulate and amenorrhea by inhibiting GnRH" },
      { label: "C", text: "It causes galactorrhea and decreases libido" },
      { label: "D", text: "It results from hypothalamic destruction or prolactin-secreting tumors" },
    ], correct: "A",
  },
  {
    id: 27, section: "Internal Medicine", number: 27,
    text: "A 25-year-old woman presents with dizziness and shaking 1 hour after meals. Fingerstick glucose is 3.3 mmol/L. What is the likely diagnosis?",
    options: [
      { label: "A", text: "Insulinoma" },
      { label: "B", text: "Diabetes mellitus" },
      { label: "C", text: "Fasting hypoglycemia" },
      { label: "D", text: "Reactive hypoglycemia" },
    ], correct: "D",
  },
  {
    id: 28, section: "Internal Medicine", number: 28,
    text: "A patient being treated for hyperthyroidism develops fever and sore throat. What is the most appropriate next step?",
    options: [
      { label: "A", text: "Add a beta-blocker" },
      { label: "B", text: "Give granulocyte colony-stimulating factor" },
      { label: "C", text: "Continue medication and monitor" },
      { label: "D", text: "Check WBC count immediately" },
    ], correct: "D",
  },
  {
    id: 29, section: "Internal Medicine", number: 29,
    text: "Type 1 diabetics, prior to diagnosis, display polydipsia, polyuria, and polyphagia. The polyuria is due to which of the following?",
    options: [
      { label: "A", text: "Osmotic imbalance due to elevated ketones in the blood" },
      { label: "B", text: "Insulin stimulation of glucose resorption in the kidney" },
      { label: "C", text: "Osmotic imbalance due to increased glucose levels in the urine" },
      { label: "D", text: "Insulin stimulation of urea production" },
    ], correct: "C",
  },
  {
    id: 30, section: "Internal Medicine", number: 30,
    text: "A hypertensive patient with psychotic symptoms is believed by the psychiatrist to have an underlying endocrine disorder. Which of the following endocrine conditions is least likely to be the underlying cause?",
    options: [
      { label: "A", text: "Phaeochromocytoma" },
      { label: "B", text: "Cushing's disease" },
      { label: "C", text: "Growth hormone producing adenoma" },
      { label: "D", text: "Hyperthyroidism" },
    ], correct: "C",
  },
  {
    id: 31, section: "Internal Medicine", number: 31,
    text: "A 22-year-old nurse has been referred with a provisional diagnosis of Graves' disease. Which of the following clinical signs in the hands is least likely to be found on general examination?",
    options: [
      { label: "A", text: "Terry's nails" },
      { label: "B", text: "Digital clubbing" },
      { label: "C", text: "Plummer's nails" },
      { label: "D", text: "Warm and moist palms" },
    ], correct: "B",
  },
  {
    id: 32, section: "Internal Medicine", number: 32,
    text: "A 42-year-old adult is diagnosed with a secretory pituitary tumor located in the anterior lobe. Blood work shows elevated levels of growth hormone (GH). The patient reports enlarged hands and feet and changes in facial features developing over several years. What is the most plausible explanation for the observed symptoms?",
    options: [
      { label: "A", text: "The secretory tumor causes hypersecretion of GH from the anterior pituitary, leading to acromegaly in this adult patient" },
      { label: "B", text: "The hypothalamus is producing too much inhibiting hormones, which stimulates GH release causing the symptoms" },
      { label: "C", text: "The tumor causes hyposecretion of growth hormone, resulting in slow metabolism and small stature" },
      { label: "D", text: "A non-secretory tumor is physically pressing on areas controlling metabolism and growth causing the symptoms without hormonal changes" },
    ], correct: "A",
  },
  {
    id: 33, section: "Internal Medicine", number: 33,
    text: "True statements about phaeochromocytoma include:",
    options: [
      { label: "A", text: "Neurofibromatosis lesions or café au lait spots are present in most patients" },
      { label: "B", text: "There is a known association with Down's syndrome" },
      { label: "C", text: "Hypertension is persistent rather than episodic in 50 percent of cases" },
      { label: "D", text: "Most cases are associated with MEN IIa" },
    ], correct: "C",
  },
  {
    id: 34, section: "Internal Medicine", number: 34,
    text: "A patient with diagnosed retroviral disease who defaulted on treatment presents with a history of darkening of the palms and soles as well as old scars on the skin. The most likely cause for this new presentation is:",
    options: [
      { label: "A", text: "HIV-related adrenocortical insufficiency" },
      { label: "B", text: "Medication-related photosensitivity from the medications taken earlier" },
      { label: "C", text: "Malnutrition-related Vitamin B12 deficiency" },
      { label: "D", text: "Disease-related progression from HIV infection to AIDS" },
    ], correct: "A",
  },
  {
    id: 35, section: "Internal Medicine", number: 35,
    text: "A 35-year-old patient visits their endocrinologist reporting symptoms of excessive thirst, frequent urination, and fatigue. Imaging reveals a benign tumor on the posterior lobe of the pituitary gland. Laboratory tests show decreased levels of ADH. Which explanation best describes how the tumor might be affecting the patient's hormone regulation?",
    options: [
      { label: "A", text: "The tumor is interfering with the hypothalamic neurosecretory cells producing ADH, resulting in hyposecretion and symptoms of diabetes insipidus" },
      { label: "B", text: "The anterior pituitary is overproducing ADH due to stimulation by hypothalamic hormones" },
      { label: "C", text: "The tumor is causing hypersecretion of ADH, leading to excessive water retention and diluted blood" },
      { label: "D", text: "The tumor is pressing on the brainstem, indirectly causing increased temperature and metabolism changes linked to ADH imbalance" },
    ], correct: "A",
  },
  {
    id: 36, section: "Internal Medicine", number: 36,
    text: "During investigation of a 40-year-old male patient presenting with erectile dysfunction, blood levels of prolactin were found to be significantly elevated. A brain MRI, however, did not show a pituitary adenoma. Which of the following other tests may help elucidate the cause of the hyperprolactinaemia?",
    options: [
      { label: "A", text: "Blood urea and creatinine" },
      { label: "B", text: "Blood lipid profile" },
      { label: "C", text: "Serum PSA level" },
      { label: "D", text: "Full blood count" },
    ], correct: "A",
  },
  {
    id: 37, section: "Internal Medicine", number: 37,
    text: "Investigations in an adult patient being investigated for 6 weeks of recurrent diarrhoea have excluded an underlying infection. Which of the following endocrine conditions could best explain the patient's presenting complaint?",
    options: [
      { label: "A", text: "Hyperparathyroidism" },
      { label: "B", text: "Addison's disease" },
      { label: "C", text: "Conn's syndrome" },
      { label: "D", text: "Primary hypothyroidism" },
    ], correct: "A",
  },
  {
    id: 38, section: "Internal Medicine", number: 38,
    text: "A patient with truncal obesity, abdominal striae, blood pressure of 170/96 mmHg and random blood glucose of 10 mmol/L is referred with a presumptive diagnosis of Cushing's syndrome. Which of the following assessments would help confirm or exclude the diagnosis?",
    options: [
      { label: "A", text: "Ability to reduce the blood pressure with potassium-sparing diuretics" },
      { label: "B", text: "No need for any tests since the patient has well-known clinical features of Cushing's syndrome" },
      { label: "C", text: "Comparing the plasma cortisol levels at 8 am on 2 consecutive days following 1 mg dexamethasone given before bedtime after the first blood sample" },
      { label: "D", text: "Comparing the 8 am plasma cortisol levels taken on 2 consecutive days, having given the patient 8 mg dexamethasone before bedtime following the first blood sample" },
    ], correct: "C",
  },
  {
    id: 39, section: "Internal Medicine", number: 39,
    text: "Which of the following is NOT a common symptom of hypoglycemia?",
    options: [
      { label: "A", text: "Polyuria" },
      { label: "B", text: "Confusion" },
      { label: "C", text: "Sweating" },
      { label: "D", text: "Tremor" },
    ], correct: "A",
  },
  {
    id: 40, section: "Internal Medicine", number: 40,
    text: "An elderly woman on long-term glucocorticoids is at risk of:",
    options: [
      { label: "A", text: "Renal stones from low calcium" },
      { label: "B", text: "Secondary osteoporosis" },
      { label: "C", text: "Hypocalcemia due to PTH overproduction" },
      { label: "D", text: "Decreased intestinal phosphate absorption" },
    ], correct: "B",
  },
  {
    id: 41, section: "Internal Medicine", number: 41,
    text: "A 55-year-old patient previously diagnosed with Graves' disease presented to the endocrine clinic with clinical presentation of hypothyroidism. The appropriate reason behind the appearance of hypothyroid manifestations between the episodes of hyperthyroidism in some patients with Graves' disease is:",
    options: [
      { label: "A", text: "Coexistence of TSH-receptor stimulating and inhibiting autoantibodies" },
      { label: "B", text: "Presence of immunoglobulins that are directed to antigens other than TSH receptor" },
      { label: "C", text: "Excessive levels of plasma TSI and inhibiting autoantibodies" },
      { label: "D", text: "Both coexistence of TSH-receptor stimulating and inhibiting autoantibodies and excessive levels of plasma TSI and inhibiting autoantibodies" },
    ], correct: "A",
  },
];

const PED: PQQuestion[] = [
  {
    id: 42, section: "Pediatrics", number: 1,
    text: "Eighteen-year-old boy presented to the endocrine clinic on account of abnormal growth by the parents. The boy is 8 feet tall and wears a customise shoe size of 49. Metabolic action of the abnormal hormone in this patient includes all of the following EXCEPT:",
    options: [
      { label: "A", text: "Increased protein synthesis" },
      { label: "B", text: "Increased bone growth" },
      { label: "C", text: "Increased glucose uptake" },
      { label: "D", text: "Increased lipolysis" },
    ], correct: "C",
  },
  {
    id: 43, section: "Pediatrics", number: 2,
    text: "A one-and-a-half-year-old female presents lethargic, sweaty, and tremulous with no history of recent illness or fever, no history of trauma. On further questioning she had been cared for by her grandmother that morning; she has multiple medical conditions and is on a number of different medications. This patient's presentation is most consistent with which of the following ingestions and what would you do next?",
    options: [
      { label: "A", text: "Tricyclic antidepressant: intubate, administer charcoal via nasogastric tube" },
      { label: "B", text: "Oral hypoglycaemic agent: obtain a finger-stick glucose, prepare to give dextrose" },
      { label: "C", text: "Beta-blocker: obtain an EKG, begin IV fluid resuscitation" },
      { label: "D", text: "Opioid overdose: perform a pupillary assessment, administer naloxone" },
    ], correct: "B",
  },
  {
    id: 44, section: "Pediatrics", number: 3,
    text: "A 17-year-old girl is 4 ft 10 in tall. Her father is 5 ft 10 in tall and her mother is 5 ft 5 in tall. Her past medical history is significant for lifelong short stature and cardiac surgery at age 1 year. She has never had a menstrual period. Which of the following is the most appropriate action?",
    options: [
      { label: "A", text: "Ultrasonogram of the abdomen" },
      { label: "B", text: "Chromosomal analysis" },
      { label: "C", text: "Serum testosterone levels" },
      { label: "D", text: "Referral to a paediatric endocrinologist" },
    ], correct: "B",
  },
  {
    id: 45, section: "Pediatrics", number: 4,
    text: "A 2-year-old boy has been slightly less than the 50th percentile for weight, height, and head circumference, but in the last 6 months he has fallen to slightly less than the 25th percentile for weight. The pregnancy was normal, his development is as expected, and the family reports no psychosocial problems. The mother says that he is now a finicky eater. His examination is normal. Which of the following is the best next step in his care?",
    options: [
      { label: "A", text: "Magnetic resonance imaging (MRI) of the brain" },
      { label: "B", text: "Sweat chloride testing" },
      { label: "C", text: "Reassurance and counselling for family about childhood normal developmental stage" },
      { label: "D", text: "Examination of the eyes for retinal haemorrhages" },
    ], correct: "C",
  },
  {
    id: 46, section: "Pediatrics", number: 5,
    text: "A 7-month-old previously healthy female infant is brought to the ED with a 2-day history of poor oral intake associated with diarrhoea and vomiting. Her mother found the child limp and lethargic. A glucose level is 1.7 mmol/L. A dextrose bolus is initiated. No hepatomegaly is noted on physical examination. Ammonia level is noted to be elevated. Which of the following is the most likely diagnosis?",
    options: [
      { label: "A", text: "Fatty acid oxidation disorder" },
      { label: "B", text: "Sepsis" },
      { label: "C", text: "Lysosomal storage defects" },
      { label: "D", text: "Heart failure" },
    ], correct: "A",
  },
  {
    id: 47, section: "Pediatrics", number: 6,
    text: "A 10-year-old male presented with short stature. He has been short since the age of 3 and has been teased by his classmates. He had no medical conditions and takes no medications. His mother is 5' tall. Father is not available and the history from mother reveals that the father's family 'were all late bloomers.' His bone age is 2 years delayed. His testicular size is in keeping with his bone age. What is the best approach to this patient?",
    options: [
      { label: "A", text: "Start treatment with growth hormone (GH)" },
      { label: "B", text: "Take a detailed history including birth history and social history" },
      { label: "C", text: "Do a brain MRI to rule out a pituitary tumor" },
      { label: "D", text: "Start testosterone therapy" },
    ], correct: "B",
  },
  {
    id: 48, section: "Pediatrics", number: 7,
    text: "A 3-day-old infant becomes encephalopathic when formula feeding is started. His plasma ammonia is elevated with blood and urinary amino acid abnormalities characteristic of an amino acid disorder. His condition worsens despite dietary modification. Which of the following would be the best management?",
    options: [
      { label: "A", text: "Administer a specific enzyme by injection" },
      { label: "B", text: "Institute haemofiltration" },
      { label: "C", text: "Perform a liver biopsy for histology" },
      { label: "D", text: "Referral for liver transplantation" },
    ], correct: "D",
  },
  {
    id: 49, section: "Pediatrics", number: 8,
    text: "A 14-year-old male is referred for evaluation of short stature. He is the shortest in his class. His father had delayed puberty and reached his final height of 5'10\" at age 18 years. His bone age is 12 years. His growth velocity and examination are normal. Which diagnosis is most consistent with these findings?",
    options: [
      { label: "A", text: "Growth hormone deficiency" },
      { label: "B", text: "Constitutional growth delay" },
      { label: "C", text: "Turner syndrome" },
      { label: "D", text: "Hypothyroidism" },
    ], correct: "B",
  },
  {
    id: 50, section: "Pediatrics", number: 9,
    text: "A neonate is brought in at 1 week of age for vomiting that has progressed to projectile and reduced urine output. The infant is afebrile, weight is less than birth weight. He appears dry. Electrolytes: Na 126, K 6.1, Cl 96. Which of the following is the most likely diagnosis?",
    options: [
      { label: "A", text: "Salt-losing congenital adrenal hyperplasia" },
      { label: "B", text: "Pyloric stenosis" },
      { label: "C", text: "Addison disease" },
      { label: "D", text: "Diabetes insipidus" },
    ], correct: "A",
  },
  {
    id: 51, section: "Pediatrics", number: 10,
    text: "A 12-year-old girl is referred for evaluation of polyuria and polydipsia. She is otherwise healthy. Her growth parameters and physical exam are normal. Urinalysis reveals glucose in the urine. Which of the following initial tests is most important to order?",
    options: [
      { label: "A", text: "Growth hormone stimulation testing" },
      { label: "B", text: "Thyroid function testing" },
      { label: "C", text: "Check her urine for the presence of ketones" },
      { label: "D", text: "Serum insulin levels" },
    ], correct: "C",
  },
  {
    id: 52, section: "Pediatrics", number: 11,
    text: "A 15-year-old male presented with tall stature, small testes, gynecomastia and learning difficulties. He has poor shaving and low muscle mass. Which investigation is most appropriate?",
    options: [
      { label: "A", text: "GH stimulation test" },
      { label: "B", text: "Thyroid function test" },
      { label: "C", text: "Chromosomal analysis" },
      { label: "D", text: "Serum LH and FSH" },
    ], correct: "C",
  },
  {
    id: 53, section: "Pediatrics", number: 12,
    text: "A 3-day-old infant becomes encephalopathic when formula feeding is started. His plasma ammonia is elevated with blood and urinary amino acid abnormalities characteristic of an amino acid disorder. He worsens despite dietary modification. Which of the following represents definitive management?",
    options: [
      { label: "A", text: "Administer a specific enzyme by injection" },
      { label: "B", text: "Institute haemofiltration" },
      { label: "C", text: "Perform a liver biopsy for histology" },
      { label: "D", text: "Referral for liver transplantation" },
    ], correct: "D",
  },
  {
    id: 54, section: "Pediatrics", number: 13,
    text: "A 3-year-old girl presents with an enlarged clitoris, hyperpigmentation and an electrolyte profile consistent with salt wasting. Ultrasound shows a normal uterus and ovaries. A palpable gonad is noted in the right inguinal region. What is the most likely diagnosis?",
    options: [
      { label: "A", text: "Androgen insensitivity syndrome" },
      { label: "B", text: "True hermaphroditism" },
      { label: "C", text: "Congenital adrenal hyperplasia" },
      { label: "D", text: "Partial androgen insensitivity" },
    ], correct: "B",
  },
  {
    id: 55, section: "Pediatrics", number: 14,
    text: "A 1-year-old male is referred for evaluation of hypotonia. On examination there is a small phallus and undescended testes. He feeds poorly and has central hypotonia. Chromosome analysis reveals 46 XY. Which syndrome is most likely?",
    options: [
      { label: "A", text: "Klinefelter syndrome" },
      { label: "B", text: "Prader-Willi syndrome" },
      { label: "C", text: "Noonan syndrome" },
      { label: "D", text: "Down syndrome" },
    ], correct: "B",
  },
  {
    id: 56, section: "Pediatrics", number: 15,
    text: "A 14-year-old girl is referred for evaluation of short stature and primary amenorrhoea. She has a small mandible, low hairline, broad chest and widely spaced nipples. Which of the following is the most appropriate action?",
    options: [
      { label: "A", text: "Growth hormone stimulation testing" },
      { label: "B", text: "Chromosomal analysis" },
      { label: "C", text: "Thyroid function testing" },
      { label: "D", text: "Karyotype analysis and GH testing" },
    ], correct: "B",
  },
  {
    id: 57, section: "Pediatrics", number: 16,
    text: "A 17-year-old girl presents with primary amenorrhoea. She has no pubic or axillary hair. Breasts are well developed. She has an inguinal hernia scar from childhood. Chromosome analysis reveals 46 XY. Which is the most likely diagnosis?",
    options: [
      { label: "A", text: "Turner syndrome" },
      { label: "B", text: "Prader-Willi syndrome" },
      { label: "C", text: "Androgen insensitivity syndrome" },
      { label: "D", text: "Congenital adrenal hyperplasia" },
    ], correct: "C",
  },
  {
    id: 58, section: "Pediatrics", number: 17,
    text: "A 4-day-old term neonate develops jaundice, poor feeding and vomiting. Urine reducing substances are positive (non-glucose). The infant is on breast milk. Blood culture grows E. coli. What is the most likely underlying metabolic disorder?",
    options: [
      { label: "A", text: "Hereditary fructose intolerance" },
      { label: "B", text: "Maple syrup urine disease" },
      { label: "C", text: "Phenylketonuria" },
      { label: "D", text: "Galactosemia" },
    ], correct: "D",
  },
  {
    id: 59, section: "Pediatrics", number: 18,
    text: "A 6-month-old girl, born at 30 weeks gestation, is brought in for a well-baby visit. Her weight and length are below the 5th percentile for chronological age. Her parents are concerned about her growth. What is the most appropriate response?",
    options: [
      { label: "A", text: "Initiate GH therapy" },
      { label: "B", text: "Order thyroid function tests" },
      { label: "C", text: "Reassure parents — growth below 5th percentile is expected at this age corrected for prematurity" },
      { label: "D", text: "Plot her growth parameters using corrected age and assess trajectory" },
    ], correct: "D",
  },
  {
    id: 60, section: "Pediatrics", number: 19,
    text: "A 2-year-old child presents with alopecia, perioral and perineal rash, and recurrent infections. Metabolic workup shows metabolic acidosis with elevated lactate and hyperammonemia. Urine organic acid analysis shows elevated 3-methylcrotonylglycine. What is the most likely diagnosis?",
    options: [
      { label: "A", text: "Methylmalonic acidemia" },
      { label: "B", text: "Propionic acidemia" },
      { label: "C", text: "Isovaleric acidemia" },
      { label: "D", text: "Biotinidase deficiency" },
    ], correct: "D",
  },
  {
    id: 61, section: "Pediatrics", number: 20,
    text: "A 6-week-old male presents with non-bilious projectile vomiting after feeds. He is hungry after vomiting. Electrolytes reveal low chloride, low potassium, and elevated bicarbonate. What is the most likely metabolic abnormality?",
    options: [
      { label: "A", text: "Hypochloremic metabolic alkalosis" },
      { label: "B", text: "Hyperchloremic metabolic acidosis" },
      { label: "C", text: "Normal anion gap metabolic acidosis" },
      { label: "D", text: "Respiratory alkalosis" },
    ], correct: "A",
  },
  {
    id: 62, section: "Pediatrics", number: 21,
    text: "A 9-month-old infant presents with a first seizure following a prolonged fast. Blood glucose is 1.8 mmol/L. Lactate is elevated but ketones are low. Liver enzymes are elevated. What is the most likely diagnosis?",
    options: [
      { label: "A", text: "Urea cycle defect" },
      { label: "B", text: "Pyruvate kinase deficiency" },
      { label: "C", text: "Propionic acidemia" },
      { label: "D", text: "Glycogen storage disease" },
    ], correct: "D",
  },
  {
    id: 63, section: "Pediatrics", number: 22,
    text: "A 2-month-old infant presents with poor feeding, vomiting, and lethargy. Blood glucose is 1.5 mmol/L. Ammonia is elevated at 320 μmol/L. Urine organic acids and plasma lactate are normal. Plasma amino acids show elevated glutamine. Which diagnosis is most likely?",
    options: [
      { label: "A", text: "Urea cycle defect" },
      { label: "B", text: "Sepsis" },
      { label: "C", text: "Lysosomal storage disorder" },
      { label: "D", text: "Heart failure" },
    ], correct: "A",
  },
  {
    id: 64, section: "Pediatrics", number: 23,
    text: "A 14-year-old boy presents with delayed puberty. He has no pubertal development and very small testes. His LH and FSH are very low. GnRH stimulation fails to produce a rise in LH or FSH. He has anosmia. Which treatment is most appropriate?",
    options: [
      { label: "A", text: "Daily testosterone injections" },
      { label: "B", text: "Observation until adulthood" },
      { label: "C", text: "Growth hormone therapy" },
      { label: "D", text: "Pulsatile GnRH administration" },
    ], correct: "D",
  },
  {
    id: 65, section: "Pediatrics", number: 24,
    text: "A 3-year-old girl is referred because her mother notices bilateral breast development. She has no pubic or axillary hair. Bone age is normal. LH and FSH are prepubertal. What is the most likely diagnosis?",
    options: [
      { label: "A", text: "Premature thelarche" },
      { label: "B", text: "Central precocious puberty" },
      { label: "C", text: "Adrenal tumor" },
      { label: "D", text: "Estrogen-secreting ovarian cyst" },
    ], correct: "A",
  },
  {
    id: 66, section: "Pediatrics", number: 25,
    text: "A 10-year-old girl presents with short stature, weight gain, fatigue, constipation, cold intolerance, and thin, dry hair. Deep tendon reflexes show delayed relaxation. Which test is most appropriate?",
    options: [
      { label: "A", text: "Growth hormone stimulation test" },
      { label: "B", text: "Karyotype analysis" },
      { label: "C", text: "Brain MRI" },
      { label: "D", text: "Thyroid function tests" },
    ], correct: "D",
  },
  {
    id: 67, section: "Pediatrics", number: 26,
    text: "A 3-month-old male infant presents with irritability, poor feeding, and an enlarged liver. He has fasting hypoglycemia with elevated lactic acid, uric acid, and triglycerides. Liver biopsy shows abundant glycogen deposits. Which diagnosis best fits?",
    options: [
      { label: "A", text: "Fatty acid oxidation disorder" },
      { label: "B", text: "Lysosomal storage disease" },
      { label: "C", text: "Urea cycle defect" },
      { label: "D", text: "Glycogen storage disease (von Gierke)" },
    ], correct: "D",
  },
  {
    id: 68, section: "Pediatrics", number: 27,
    text: "Which of the following is NOT a result of neonatal hypothyroidism (cretinism)?",
    options: [
      { label: "A", text: "Mental retardation" },
      { label: "B", text: "Endemic goiter" },
      { label: "C", text: "Somnolence and poor feeding" },
      { label: "D", text: "Disproportionate short stature" },
    ], correct: "B",
  },
];

const SURG: PQQuestion[] = [
  {
    id: 69, section: "Surgery", number: 1,
    text: "Considering the blood supply to the thyroid gland, which of these statements is true?",
    options: [
      { label: "A", text: "The superior thyroid artery is a branch of the internal carotid artery" },
      { label: "B", text: "The inferior thyroid artery takes its source directly from a branch of the axillary artery" },
      { label: "C", text: "Occasionally, it gets supply from the thyroidea ima which takes its source from the thyro-cervical trunk" },
      { label: "D", text: "It has blood supply from the superior, middle, and inferior thyroid arteries" },
    ], correct: "C",
  },
  {
    id: 70, section: "Surgery", number: 2,
    text: "A 26-year-old woman presents with bilateral milky nipple discharge. A CT scan of the head detects a 5 cm size pituitary tumour that has expanded the sella turcica. Three weeks after discharge the woman is rushed into the emergency room with headache and neck stiffness, after a week's history of clear fluid discharge nasally. Your initial impression will be that she has post-surgical:",
    options: [
      { label: "A", text: "Intra-sellar re-bleed" },
      { label: "B", text: "Meningitis" },
      { label: "C", text: "Intracerebral haemorrhage" },
      { label: "D", text: "Subarachnoid haemorrhage" },
    ], correct: "B",
  },
  {
    id: 71, section: "Surgery", number: 3,
    text: "Which of the following is a necessary investigation prior to operating on a 50-year-old woman diagnosed with a non-toxic multinodular goiter?",
    options: [
      { label: "A", text: "A core biopsy of the neck mass" },
      { label: "B", text: "A thyroid scintiscan" },
      { label: "C", text: "A neck ultrasound scan" },
      { label: "D", text: "CT scan of the neck and chest" },
    ], correct: "C",
  },
  {
    id: 72, section: "Surgery", number: 4,
    text: "Identify the correct statement concerning the anatomy of the parathyroid gland.",
    options: [
      { label: "A", text: "Each pair of parathyroid on each side is supplied mainly by the superior thyroid artery" },
      { label: "B", text: "The superior pair are always supplied by the superior thyroid artery of the ipsilateral side" },
      { label: "C", text: "The thyroidea ima may sometimes be the main blood supply to the inferior pair of parathyroid glands" },
      { label: "D", text: "All four glands receive their blood supply mainly from the inferior thyroid artery" },
    ], correct: "D",
  },
  {
    id: 73, section: "Surgery", number: 5,
    text: "In a patient diagnosed with primary hyperparathyroidism, which of these investigations would help in localizing the offending gland?",
    options: [
      { label: "A", text: "General body bone scan" },
      { label: "B", text: "Plain cervical x-ray" },
      { label: "C", text: "CT scan of the neck and chest" },
      { label: "D", text: "Fine needle aspiration cytology" },
    ], correct: "C",
  },
  {
    id: 74, section: "Surgery", number: 6,
    text: "A 56-year-old lady had a total thyroidectomy for a follicular carcinoma of the thyroid gland. In the process, the parathyroid glands were accidentally devascularized causing her to have hypoparathyroidism. Which of these signs will be present?",
    options: [
      { label: "A", text: "Tetany" },
      { label: "B", text: "Diplopia" },
      { label: "C", text: "Polydipsia" },
      { label: "D", text: "Proptosis" },
    ], correct: "A",
  },
  {
    id: 75, section: "Surgery", number: 7,
    text: "A 60-year-old man presents at the surgical OPD with a solitary thyroid nodule in the left thyroid lobe. He is euthyroid. Which of the following statements concerning the management of his condition is right?",
    options: [
      { label: "A", text: "He will need only an ultrasound and left lobectomy and isthmusectomy" },
      { label: "B", text: "He requires a core biopsy, followed by total thyroidectomy" },
      { label: "C", text: "He will need an incisional biopsy and a left lobectomy if it is not malignant" },
      { label: "D", text: "He requires a FNA to be followed by a total thyroidectomy" },
    ], correct: "D",
  },
  {
    id: 76, section: "Surgery", number: 8,
    text: "A 30-year-old man presents with a painless, mid-line neck mass that moves up on protruding the tongue and on swallowing. Which statement concerning the investigation of this pathology is correct?",
    options: [
      { label: "A", text: "As part of the radiologic assessment of the patient, a CT-scan of the neck is indicated" },
      { label: "B", text: "A plain cervical x-ray is an important pre-operative requirement" },
      { label: "C", text: "An ultrasound of the neck is sufficient to fully assess the patient radiologically, prior to surgery" },
      { label: "D", text: "A core biopsy is always necessary for histology in the pre-operative setting" },
    ], correct: "C",
  },
  {
    id: 77, section: "Surgery", number: 9,
    text: "A 45-year-old woman presents with an anterior neck swelling of 1 year duration. FNAC suggests a follicular neoplasm. With this cytopathological diagnosis, the surgical procedure of choice will be:",
    options: [
      { label: "A", text: "Total thyroidectomy" },
      { label: "B", text: "Subtotal thyroidectomy" },
      { label: "C", text: "Core biopsy for a more definitive diagnosis" },
      { label: "D", text: "Lobectomy with safety margins" },
    ], correct: "D",
  },
  {
    id: 78, section: "Surgery", number: 10,
    text: "A 26-year-old woman with a 5 cm pituitary tumour subsequently complains of excruciating headache suggesting an intracranial bleed. The clinical endocrine syndrome that may result from this complication is:",
    options: [
      { label: "A", text: "Pituitary apoplexy" },
      { label: "B", text: "Anterior hypopituitarism" },
      { label: "C", text: "Hypoprolactinaemia" },
      { label: "D", text: "Panhypopituitarism" },
    ], correct: "A",
  },
  {
    id: 79, section: "Surgery", number: 11,
    text: "A 26-year-old woman with bilateral milky nipple discharge. A CT scan of the head detects a 5 cm size pituitary tumour that has expanded the sella turcica. This tumour is likely to be a pituitary:",
    options: [
      { label: "A", text: "Adenocarcinoma" },
      { label: "B", text: "Adenoma" },
      { label: "C", text: "Hyperplasia" },
      { label: "D", text: "Carcinoma" },
    ], correct: "B",
  },
  {
    id: 80, section: "Surgery", number: 12,
    text: "The woman with the pituitary tumour survives the bout of headache and subsequently has a hypophysectomy to remove her pituitary tumour. A sequential complication that can result from her hypophysectomy is:",
    options: [
      { label: "A", text: "Hypoprolactinaemia" },
      { label: "B", text: "Pituitary apoplexy" },
      { label: "C", text: "Panhypopituitarism" },
      { label: "D", text: "Empty sellar syndrome" },
    ], correct: "C",
  },
  {
    id: 81, section: "Surgery", number: 13,
    text: "A patient with primary hyperparathyroidism undergoes neck exploration where four small, normal appearing glands are found. What are the possible locations of an additional, supernumerary gland?",
    options: [
      { label: "A", text: "In the thymus" },
      { label: "B", text: "In the thyroid gland" },
      { label: "C", text: "In the tracheoesophageal groove" },
      { label: "D", text: "All of the above" },
    ], correct: "D",
  },
  {
    id: 82, section: "Surgery", number: 14,
    text: "Following recent thyroidectomy for Grave's disease, which of the following clinical signs, if present in the patient, could be attributed to a direct complication of the surgery?",
    options: [
      { label: "A", text: "Chvostek's sign" },
      { label: "B", text: "Kernig's sign" },
      { label: "C", text: "Tinel's sign" },
      { label: "D", text: "Homan's sign" },
    ], correct: "A",
  },
  {
    id: 83, section: "Surgery", number: 15,
    text: "A 55-year-old female presents with multiple thyroid nodules detected on ultrasound, most of which appear hypofunctioning on radioactive iodine scan. She has no prior radiation exposure. Fine-needle aspiration of a dominant nodule shows uniform follicular cells with no nuclear atypia. Which factor most significantly impacts the probability of this nodule being malignant?",
    options: [
      { label: "A", text: "Patient's age (55 years)" },
      { label: "B", text: "Functionality of nodules on imaging" },
      { label: "C", text: "Absence of radiation history" },
      { label: "D", text: "Solitary versus multiple nodules" },
    ], correct: "B",
  },
  {
    id: 84, section: "Surgery", number: 16,
    text: "A 45-year-old male with a history of childhood radiation therapy presents with a thyroid nodule. Scintigraphy reveals a cold nodule. Surgical excision confirms papillary carcinoma. Which prognostic factor would most critically influence the patient's 10-year survival outcome?",
    options: [
      { label: "A", text: "The patient's young age and absence of distant metastases" },
      { label: "B", text: "Presence of cervical lymph node metastases" },
      { label: "C", text: "The presence or absence of extra-thyroidal extension and distant metastases" },
      { label: "D", text: "The multiplicity of lesions in the thyroid gland" },
    ], correct: "C",
  },
  {
    id: 85, section: "Surgery", number: 17,
    text: "A 30-year-old woman presents with a diffusely enlarged thyroid containing multiple nodules. A single nodule has been noted to be hot on radionuclide imaging. Fine-needle aspiration suggests a benign lesion. Which is the most accurate assessment regarding the risk of malignancy in this patient's hot thyroid nodule?",
    options: [
      { label: "A", text: "Multiplicity of nodules in a young patient increases malignancy risk equally for hot nodules" },
      { label: "B", text: "The hot nodule is significantly more likely to be benign than malignant" },
      { label: "C", text: "Hot nodules are equally suspicious as cold nodules in patients with multiple nodules" },
      { label: "D", text: "The hot nodule is more likely to be malignant than benign" },
    ], correct: "B",
  },
  {
    id: 86, section: "Surgery", number: 18,
    text: "In which of the following pathologies will thyroid scintigraphy be necessary?",
    options: [
      { label: "A", text: "A middle-aged woman with a long-standing goiter who develops severe pain and tenderness in the goiter" },
      { label: "B", text: "An elderly man with a non-toxic multinodular goiter" },
      { label: "C", text: "A patient with suspected anaplastic goiter" },
      { label: "D", text: "A 60-year-old lady with a multinodular goiter with signs and symptoms of toxicity" },
    ], correct: "D",
  },
  {
    id: 87, section: "Surgery", number: 19,
    text: "A 64-year-old woman presented with a painful and tender mass that was warm to touch with the skin showing signs of cellulitis and oozing pus from its surface. What is the best approach to managing this patient?",
    options: [
      { label: "A", text: "Treat her on an appropriate dose of radio iodine" },
      { label: "B", text: "Treat her on Aspirin and monitor" },
      { label: "C", text: "Do an emergency total thyroidectomy" },
      { label: "D", text: "Treat her on an appropriate antibiotic" },
    ], correct: "D",
  },
  {
    id: 88, section: "Surgery", number: 20,
    text: "A 24-year-old lady presented to the clinic with a mass in the neck. She was fidgety, anxious and sweating in a rather well-ventilated consulting room. Which of the following will be an expected sign on examining her?",
    options: [
      { label: "A", text: "A cold dry palm" },
      { label: "B", text: "A wet warm palm" },
      { label: "C", text: "A slow pulse" },
      { label: "D", text: "A normal tendon reflex" },
    ], correct: "B",
  },
];

const PATH: PQQuestion[] = [
  {
    id: 89, section: "Pathology", number: 1,
    text: "A 45-year-old woman presents with an anterior neck swelling of 1 year duration. FNAC suggests a follicular lesion. Following the FNAC, the surgeon does a thyroidectomy. Pathologically this lesion is likely to be a:",
    options: [
      { label: "A", text: "Follicular carcinoma" },
      { label: "B", text: "Follicular variant of a papillary carcinoma" },
      { label: "C", text: "Follicular adenoma" },
      { label: "D", text: "Follicular variant of a papillary adenoma" },
    ], correct: "C",
  },
  {
    id: 90, section: "Pathology", number: 2,
    text: "A 43-year-old man presented with proximal muscle weakness, truncal obesity and a rounded face. After investigation they found low levels of both CRH and ACTH but high cortisol. Biopsy showed vacuolated neoplastic cells with mild nuclear pleomorphism and no evidence of mitotic activity and necrosis. What is the diagnosis?",
    options: [
      { label: "A", text: "Cushing syndrome due to small-cell carcinoma" },
      { label: "B", text: "Cushing syndrome due to adrenocortical carcinoma" },
      { label: "C", text: "Cushing syndrome due to adrenocortical adenoma" },
      { label: "D", text: "Cushing syndrome due to pituitary adenoma" },
    ], correct: "C",
  },
  {
    id: 91, section: "Pathology", number: 3,
    text: "The gene (MEN1) is:",
    options: [
      { label: "A", text: "Located at 11q13 and is a proto-oncogene" },
      { label: "B", text: "Located at 13q11 and is a tumor suppressor gene" },
      { label: "C", text: "Located at 11q13 and is a tumor suppressor gene" },
      { label: "D", text: "Located at 13q11 and is a proto-oncogene" },
    ], correct: "C",
  },
  {
    id: 92, section: "Pathology", number: 4,
    text: "What accounts for the variable features between MEN type 2A and MEN type 2B?",
    options: [
      { label: "A", text: "Differences in affected sites" },
      { label: "B", text: "Differences in mutation patterns" },
      { label: "C", text: "Differences in severity of mutations" },
      { label: "D", text: "Differences in genetic makeup" },
    ], correct: "B",
  },
  {
    id: 93, section: "Pathology", number: 5,
    text: "In primary hyperparathyroidism a chromosomal inversion on chromosome ______ results in relocation of the cyclin D1 gene.",
    options: [
      { label: "A", text: "13" },
      { label: "B", text: "10" },
      { label: "C", text: "11" },
      { label: "D", text: "12" },
    ], correct: "C",
  },
  {
    id: 94, section: "Pathology", number: 6,
    text: "The presence of which one of the following differentiates between malignant and benign pheochromocytoma?",
    options: [
      { label: "A", text: "Presence of metastases" },
      { label: "B", text: "Vascular invasion" },
      { label: "C", text: "Nuclei pleomorphism" },
      { label: "D", text: "Presence of mitotic figures" },
    ], correct: "A",
  },
  {
    id: 95, section: "Pathology", number: 7,
    text: "A 45-year-old woman presents with an anterior neck swelling. Gross examination of the excised mass revealed a solitary, well circumscribed nodule with a brown cut surface. An adjacent lymph node shows a deposit of thyroid follicle cells. To confirm your diagnosis, the pathologist needs to examine the:",
    options: [
      { label: "A", text: "Main mass for other prognostic features" },
      { label: "B", text: "Deep excision margin of the nodule" },
      { label: "C", text: "Entire capsule of the nodule" },
      { label: "D", text: "Other lymph nodes adjacent to the nodule" },
    ], correct: "C",
  },
  {
    id: 96, section: "Pathology", number: 8,
    text: "A 45-year-old woman presents with an anterior neck swelling. The histopathology report concludes that the lesion is a follicular variant of a papillary thyroid carcinoma. Histopathologically, this diagnosis was based on:",
    options: [
      { label: "A", text: "Capsular tumour invasion" },
      { label: "B", text: "Characteristic nuclear features" },
      { label: "C", text: "Vascular tumour invasion" },
      { label: "D", text: "Lymph nodal metastasis" },
    ], correct: "B",
  },
  {
    id: 97, section: "Pathology", number: 9,
    text: "A 45-year-old woman presents with an anterior neck swelling. The FNAC diagnosis of follicular neoplasm in this case hinged on finding:",
    options: [
      { label: "A", text: "Lymph nodal metastasis" },
      { label: "B", text: "Capsular tumour invasion" },
      { label: "C", text: "Vascular tumour invasion" },
      { label: "D", text: "Follicles formed by thyroid epithelial cells" },
    ], correct: "D",
  },
  {
    id: 98, section: "Pathology", number: 10,
    text: "The most common organ involved in MEN-1 is:",
    options: [
      { label: "A", text: "Thyroid" },
      { label: "B", text: "Adrenal" },
      { label: "C", text: "Testis" },
      { label: "D", text: "Parathyroid" },
    ], correct: "D",
  },
  {
    id: 99, section: "Pathology", number: 11,
    text: "A 45-year-old woman presents with an anterior neck swelling. The prognosis of this tumour will be most dependent on the fact that it is:",
    options: [
      { label: "A", text: "A high grade tumour" },
      { label: "B", text: "An early stage tumour" },
      { label: "C", text: "A papillary thyroid carcinoma" },
      { label: "D", text: "A follicular thyroid carcinoma" },
    ], correct: "B",
  },
  {
    id: 100, section: "Pathology", number: 12,
    text: "The RET gene is:",
    options: [
      { label: "A", text: "Located at 10q11.2 and is a tumor suppressor gene" },
      { label: "B", text: "Located at 10p11.2 and is a proto-oncogene" },
      { label: "C", text: "Located at 11q10.2 and is a proto-oncogene" },
      { label: "D", text: "Located at 10q11.2 and is a proto-oncogene" },
    ], correct: "D",
  },
  {
    id: 101, section: "Pathology", number: 13,
    text: "Li-Fraumani syndrome and Beckwith-Wiedemann syndrome is associated with which one of the following?",
    options: [
      { label: "A", text: "Secondary Hyperaldosteronism" },
      { label: "B", text: "Primary Hyperaldosteronism" },
      { label: "C", text: "Adrenocortical adenoma" },
      { label: "D", text: "Adrenocortical carcinoma" },
    ], correct: "D",
  },
  {
    id: 102, section: "Pathology", number: 14,
    text: "A 29-year-old male has tachycardia, tremor, high BP and sweating. The laboratory examination shows increase in urinary VMA and metanephrines. Which of the following is most likely to be associated with this condition?",
    options: [
      { label: "A", text: "Waterhouse-Friderichsen syndrome" },
      { label: "B", text: "MEN-1" },
      { label: "C", text: "Neurofibromatosis type 2" },
      { label: "D", text: "Von Hippel-Lindau disease" },
    ], correct: "D",
  },
  {
    id: 103, section: "Pathology", number: 15,
    text: "All of the following can be diagnosed on a fine needle aspiration cytology of a thyroid nodule EXCEPT:",
    options: [
      { label: "A", text: "Papillary carcinoma" },
      { label: "B", text: "Follicular carcinoma" },
      { label: "C", text: "Hurtle cell carcinoma" },
      { label: "D", text: "Medullary carcinoma" },
    ], correct: "B",
  },
  {
    id: 104, section: "Pathology", number: 16,
    text: "A 32-year-old female presents with a solitary thyroid nodule that appears cold on radionuclide scanning. She has no history of radiation exposure. Fine-needle aspiration reveals cells with optically clear nuclei, intranuclear grooves, and psammoma bodies. There is no evidence of capsular invasion on histopathology. What is the most likely diagnosis?",
    options: [
      { label: "A", text: "Follicular adenoma" },
      { label: "B", text: "Papillary thyroid carcinoma" },
      { label: "C", text: "Medullary carcinoma" },
      { label: "D", text: "Follicular carcinoma" },
    ], correct: "B",
  },
  {
    id: 105, section: "Pathology", number: 17,
    text: "A 45-year-old male patient presents with a widely infiltrative thyroid mass involving adjacent neck soft tissue. Microscopic examination reveals sheets of atypical cells with follicular differentiation absent, increased mitotic activity, and lack of psammoma bodies. Nuclear features typical of papillary carcinoma are absent. How should this tumor be classified?",
    options: [
      { label: "A", text: "Widely invasive follicular carcinoma, distinguished by infiltration beyond the capsule, absence of papillary nuclear features and psammoma bodies, and increased mitoses" },
      { label: "B", text: "Follicular adenoma with atypical features but no malignancy due to absence of vascular invasion" },
      { label: "C", text: "Papillary carcinoma variant lacking typical nuclear features but showing follicular architecture" },
      { label: "D", text: "Anaplastic (undifferentiated) carcinoma due to widely infiltrative pattern and high mitotic activity" },
    ], correct: "D",
  },
  {
    id: 106, section: "Pathology", number: 18,
    text: "A 35-year-old female patient presents with a solitary thyroid nodule. She has a history of childhood exposure to radiation therapy. Ultrasonography shows a cold nodule, and fine-needle aspiration cytology reveals cells with ground-glass nuclei, intranuclear grooves, and the presence of psammoma bodies. What is the most appropriate diagnosis?",
    options: [
      { label: "A", text: "Papillary carcinoma suspected because of solitary nodule with cold scan despite absence of nuclear features typical of papillary carcinoma" },
      { label: "B", text: "Papillary carcinoma due to solitary nodule and the importance of radiation history in etiology" },
      { label: "C", text: "Follicular adenoma diagnosed due to solitary nodule and absence of vascular invasion indicating benign lesion" },
      { label: "D", text: "Papillary carcinoma diagnosed based on ground-glass nuclei and psammoma bodies indicating malignancy with excellent prognosis" },
    ], correct: "D",
  },
  {
    id: 107, section: "Pathology", number: 19,
    text: "A 50-year-old woman undergoes thyroidectomy for a 3 cm solitary thyroid nodule. Histologically, the nodule is encapsulated and composed of uniform follicles containing colloid. There is no evidence of mitotic activity or necrosis, and the capsule is intact without vascular invasion. What is the most rational postoperative diagnosis?",
    options: [
      { label: "A", text: "Papillary carcinoma likely given solitary nodule; cytology alone is sufficient for diagnosis" },
      { label: "B", text: "Multinodular hyperplasia diagnosis; surgical removal typically unnecessary for diagnosis" },
      { label: "C", text: "Follicular carcinoma presumed despite intact capsule; surgery is both diagnostic and therapeutic" },
      { label: "D", text: "Follicular adenoma with excellent prognosis; surgery was performed due to inability to assess capsular and vascular invasion via cytology" },
    ], correct: "D",
  },
  {
    id: 108, section: "Pathology", number: 20,
    text: "A 35-year-old woman presents with a solitary thyroid nodule discovered incidentally. Ultrasonography reveals a well-circumscribed lesion, and fine-needle aspiration shows uniform follicular cells with little variation in nuclear morphology. The nodule is encapsulated on histological examination with no evidence of capsular or vascular invasion. Which diagnosis best fits?",
    options: [
      { label: "A", text: "Papillary carcinoma" },
      { label: "B", text: "Anaplastic carcinoma" },
      { label: "C", text: "Follicular carcinoma" },
      { label: "D", text: "Follicular adenoma" },
    ], correct: "D",
  },
  {
    id: 109, section: "Pathology", number: 21,
    text: "A 50-year-old male patient with a history of head and neck radiation presents with multiple thyroid nodules. Radionuclide scanning shows one \u201ccold\u201d nodule among several \u201chot\u201d nodules. Fine-needle aspiration of the cold nodule reveals nuclear grooves, pale nuclei with ground-glass appearance, and psammoma bodies. What is the most likely diagnosis of the cold nodule?",
    options: [
      { label: "A", text: "Follicular adenoma" },
      { label: "B", text: "Hürthle cell adenoma" },
      { label: "C", text: "Papillary carcinoma" },
      { label: "D", text: "Medullary carcinoma" },
    ], correct: "C",
  },
  {
    id: 110, section: "Pathology", number: 22,
    text: "A 28-year-old male with no prior radiation exposure has a 2 cm cold thyroid nodule. Fine-needle aspiration shows papillary architecture with nuclei exhibiting ground-glass chromatin, nuclear grooves, and intranuclear pseudo-inclusions. Psammoma bodies are present. No lymphadenopathy is detected. What is the most appropriate prediction regarding the biological behavior and prognosis?",
    options: [
      { label: "A", text: "Anticipate aggressive disease due to male sex and young age, suggest total thyroidectomy with prophylactic neck dissection" },
      { label: "B", text: "Suspect medullary carcinoma given cold nodule and male gender, proceed with calcitonin testing" },
      { label: "C", text: "Predict an excellent prognosis with >95% 10-year survival, given typical papillary carcinoma features, no extra-thyroidal extension or lymphadenopathy" },
      { label: "D", text: "Consider follicular carcinoma variant despite papillary features because of cold nodule status" },
    ], correct: "C",
  },
  {
    id: 111, section: "Pathology", number: 23,
    text: "A 48-year-old woman presents with a solitary thyroid nodule. Fine-needle aspiration cytology shows cells with abundant eosinophilic, granular cytoplasm (Hürthle cell change). The lesion is well encapsulated on histology with no capsular or vascular invasion. Which management strategy would best address this diagnosis?",
    options: [
      { label: "A", text: "Repeat fine-needle aspiration cytology" },
      { label: "B", text: "Observation with periodic ultrasound follow-up" },
      { label: "C", text: "Surgical excision with thorough histologic examination of capsule" },
      { label: "D", text: "Radioactive iodine therapy before surgery" },
    ], correct: "C",
  },
  {
    id: 112, section: "Pathology", number: 24,
    text: "A 55-year-old woman presents with a 4 cm solitary thyroid nodule found to be a follicular-patterned lesion after resection. The microscopic exam reveals a solid growth pattern with increased mitotic figures and focal vascular invasion beyond the capsule. The nuclei lack features of papillary carcinoma and no psammoma bodies are seen. How should this neoplasm be classified?",
    options: [
      { label: "A", text: "Minimally invasive follicular carcinoma" },
      { label: "B", text: "Papillary carcinoma, follicular variant" },
      { label: "C", text: "Widely invasive follicular carcinoma" },
      { label: "D", text: "Follicular adenoma with Hürthle cell change" },
    ], correct: "C",
  },
  {
    id: 113, section: "Pathology", number: 25,
    text: "A 60-year-old woman is found to have a solitary thyroid nodule. Fine-needle aspiration cytology reveals follicular cells with uniform nuclei lacking papillary carcinoma features. The lesion is cold on scintigraphy. Following surgical excision, histologic examination uncovers vascular and capsular invasion by neoplastic cells. What is the most appropriate diagnosis?",
    options: [
      { label: "A", text: "Papillary carcinoma" },
      { label: "B", text: "Follicular adenoma" },
      { label: "C", text: "Medullary carcinoma" },
      { label: "D", text: "Follicular carcinoma" },
    ], correct: "D",
  },
  {
    id: 114, section: "Pathology", number: 26,
    text: "A 60-year-old woman is found to have a solitary 4 cm thyroid nodule. Surgical excision reveals a widely infiltrative tumor penetrating beyond the thyroid capsule into surrounding soft tissue. Microscopically, the tumor lacks follicular architecture and shows solid and trabecular growth with increased mitotic activity. Nuclear features typical of papillary carcinoma are absent. What is the most appropriate pathological classification?",
    options: [
      { label: "A", text: "Assess as medullary carcinoma given solid growth" },
      { label: "B", text: "Classify as follicular variant of papillary carcinoma" },
      { label: "C", text: "Diagnose anaplastic (undifferentiated) carcinoma due to lack of differentiation, extensive invasion, and mitotic activity" },
      { label: "D", text: "Identify the lesion as widely invasive follicular carcinoma" },
    ], correct: "C",
  },
  {
    id: 115, section: "Pathology", number: 27,
    text: "A 32-year-old female presents with a solitary thyroid nodule. Ultrasonography reveals a well-circumscribed, encapsulated lesion with uniform follicles containing colloid. Fine-needle aspiration cytology shows cells with minimal nuclear atypia and no mitotic figures. However, histologic examination after surgical removal reveals focal capsular invasion without vascular invasion. What is the most accurate diagnosis?",
    options: [
      { label: "A", text: "Follicular adenoma; absence of capsular invasion confirms benign nature despite architecture" },
      { label: "B", text: "Follicular carcinoma with vascular invasion; vascular invasion is necessary for malignancy" },
      { label: "C", text: "Papillary carcinoma, follicular variant; diagnosis based on follicular pattern and nuclear features" },
      { label: "D", text: "Minimally invasive follicular carcinoma; presence of focal capsular invasion is the defining criterion" },
    ], correct: "D",
  },
];

const CHEM: PQQuestion[] = [
  {
    id: 116, section: "Chemical Pathology", number: 1,
    text: "Glucose tolerance test should NOT be performed under which of the following conditions?",
    options: [
      { label: "A", text: "Patient with history of hypertension" },
      { label: "B", text: "Intercurrent infection" },
      { label: "C", text: "Patient with history of myocardial infarction" },
      { label: "D", text: "Primary amenorrhea" },
    ], correct: "B",
  },
  {
    id: 117, section: "Chemical Pathology", number: 2,
    text: "HbA1c levels reflect the mean glycaemia status during the preceding:",
    options: [
      { label: "A", text: "2–3 months period" },
      { label: "B", text: "4 weeks period" },
      { label: "C", text: "4 months period" },
      { label: "D", text: "2–3 weeks period" },
    ], correct: "A",
  },
  {
    id: 118, section: "Chemical Pathology", number: 3,
    text: "Which of the following confirmed values meet the diagnostic threshold for diabetes?",
    options: [
      { label: "A", text: "Fasting plasma glucose of 7.7 mmol/L" },
      { label: "B", text: "Random plasma glucose >8.8 mmol/L" },
      { label: "C", text: "2-hour post-prandial glucose >7.0 mmol/L" },
      { label: "D", text: "Fasting plasma glucose ≥7.0 mmol/L" },
    ], correct: "D",
  },
  {
    id: 119, section: "Chemical Pathology", number: 4,
    text: "Which of the following serum measurements are NOT used for the diagnosis of diabetes mellitus?",
    options: [
      { label: "A", text: "HbA1c" },
      { label: "B", text: "Fasting plasma glucose" },
      { label: "C", text: "Insulin" },
      { label: "D", text: "Postprandial plasma glucose" },
    ], correct: "C",
  },
  {
    id: 120, section: "Chemical Pathology", number: 5,
    text: "Which of the following is a preferred specimen for glucose analysis in the laboratory?",
    options: [
      { label: "A", text: "Fluoride oxalate plasma" },
      { label: "B", text: "EDTA plasma" },
      { label: "C", text: "Heparinized plasma" },
      { label: "D", text: "Calcium citrate plasma" },
    ], correct: "A",
  },
  {
    id: 121, section: "Chemical Pathology", number: 6,
    text: "Fructosamine is formed from:",
    options: [
      { label: "A", text: "Glucose and haemoglobin" },
      { label: "B", text: "Glucose and albumin / proteins" },
      { label: "C", text: "Glucose and purines" },
      { label: "D", text: "Glucose and apolipoprotein" },
    ], correct: "B",
  },
  {
    id: 122, section: "Chemical Pathology", number: 7,
    text: "For a reliable fasting plasma glucose result, the period of food abstention should be at least:",
    options: [
      { label: "A", text: "10 hours and not exceeding 14 hours" },
      { label: "B", text: "8 hours and not exceeding 14 hours" },
      { label: "C", text: "5 hours and not exceeding 14 hours" },
      { label: "D", text: "6 hours and not exceeding 14 hours" },
    ], correct: "B",
  },
  {
    id: 123, section: "Chemical Pathology", number: 8,
    text: "Which of the following is NOT a routine test for the management of diabetes mellitus patients?",
    options: [
      { label: "A", text: "Insulin levels" },
      { label: "B", text: "Plasma lipids" },
      { label: "C", text: "Plasma creatinine" },
      { label: "D", text: "Glycated haemoglobin" },
    ], correct: "A",
  },
  {
    id: 124, section: "Chemical Pathology", number: 9,
    text: "A 50-year-old diabetic woman has an HbA1c of 7.5%. She is currently being treated with iron supplements for anemia. What is the likely reason for her HbA1c result?",
    options: [
      { label: "A", text: "False high due to iron deficiency" },
      { label: "B", text: "False low due to anemia" },
      { label: "C", text: "Improved glucose control" },
      { label: "D", text: "Improper test technique" },
    ], correct: "A",
  },
  {
    id: 125, section: "Chemical Pathology", number: 10,
    text: "A patient has low free T3, low free T4, and low TSH. What is the next best step in evaluating the cause?",
    options: [
      { label: "A", text: "Repeat thyroid function test in 6 months" },
      { label: "B", text: "Check for thyroid antibodies" },
      { label: "C", text: "Start levothyroxine" },
      { label: "D", text: "Assess for pituitary or hypothalamic disease" },
    ], correct: "D",
  },
  {
    id: 126, section: "Chemical Pathology", number: 11,
    text: "A 60-year-old diabetic patient presents with foamy urine. Which test is most appropriate for early detection of nephropathy?",
    options: [
      { label: "A", text: "Urine albumin-creatinine ratio" },
      { label: "B", text: "24-hour urine protein" },
      { label: "C", text: "Serum creatinine" },
      { label: "D", text: "Urine glucose" },
    ], correct: "A",
  },
  {
    id: 127, section: "Chemical Pathology", number: 12,
    text: "Thyroid function test results in a patient with a diagnosis of subclinical hypothyroidism would show:",
    options: [
      { label: "A", text: "Elevated TSH and normal free T3 but low free T4" },
      { label: "B", text: "Elevated TSH but normal free T3 and normal free T4" },
      { label: "C", text: "Normal TSH and free T3 but low free T4" },
      { label: "D", text: "Normal TSH but low levels of free T3 and free T4" },
    ], correct: "B",
  },
  {
    id: 128, section: "Chemical Pathology", number: 13,
    text: "A diabetic patient has HbA1c of 4.5%. He is also diagnosed with hemolytic anemia. What explains the low HbA1c?",
    options: [
      { label: "A", text: "Shortened RBC lifespan" },
      { label: "B", text: "Excellent control" },
      { label: "C", text: "Error in test" },
      { label: "D", text: "Increased insulin dose" },
    ], correct: "A",
  },
  {
    id: 129, section: "Chemical Pathology", number: 14,
    text: "In investigating a patient with hypercalcaemia believed to have a parathyroid adenoma, the most specific test to confirm the diagnosis is the:",
    options: [
      { label: "A", text: "X-rays of the thoracic inlet" },
      { label: "B", text: "MRI scan of the neck" },
      { label: "C", text: "MIBG scan" },
      { label: "D", text: "Sestamibi scan" },
    ], correct: "D",
  },
  {
    id: 130, section: "Chemical Pathology", number: 15,
    text: "What is the primary mechanism responsible for low T3 levels in euthyroid sick syndrome?",
    options: [
      { label: "A", text: "Autoimmune destruction of the thyroid" },
      { label: "B", text: "Reduced TBG synthesis" },
      { label: "C", text: "Impaired peripheral conversion of T4 to T3" },
      { label: "D", text: "Increased TSH secretion" },
    ], correct: "C",
  },
  {
    id: 131, section: "Chemical Pathology", number: 16,
    text: "A 70-year-old diabetic patient with chronic kidney disease is undergoing HbA1c monitoring. Which factor may affect the accuracy of HbA1c in this patient?",
    options: [
      { label: "A", text: "Proteinuria" },
      { label: "B", text: "Hyperglycemia" },
      { label: "C", text: "Carbamylated hemoglobin" },
      { label: "D", text: "Hyperkalemia" },
    ], correct: "C",
  },
  {
    id: 132, section: "Chemical Pathology", number: 17,
    text: "In iodine deficiency, the thyroid function test is most likely to show:",
    options: [
      { label: "A", text: "Normal TSH and T4" },
      { label: "B", text: "High TSH and low T4" },
      { label: "C", text: "High T4 and low TSH" },
      { label: "D", text: "Low TSH" },
    ], correct: "B",
  },
  {
    id: 133, section: "Chemical Pathology", number: 18,
    text: "Reverse T3 is most measured to evaluate:",
    options: [
      { label: "A", text: "Hashimoto's disease" },
      { label: "B", text: "Hyperthyroidism" },
      { label: "C", text: "Euthyroid sick syndrome" },
      { label: "D", text: "Hypothyroidism" },
    ], correct: "C",
  },
  {
    id: 134, section: "Chemical Pathology", number: 19,
    text: "In non-thyroidal illness (euthyroid sick syndrome), what is the typical hormonal pattern?",
    options: [
      { label: "A", text: "Low T3, normal/low T4, normal/low TSH" },
      { label: "B", text: "High T3, low TSH" },
      { label: "C", text: "High TSH, high T4" },
      { label: "D", text: "Elevated TSH, low T3" },
    ], correct: "A",
  },
  {
    id: 135, section: "Chemical Pathology", number: 20,
    text: "A patient with weight loss and tremors is found to have low TSH and normal free T4, but elevated total T3. What is the most likely diagnosis?",
    options: [
      { label: "A", text: "Euthyroid sick syndrome" },
      { label: "B", text: "Graves' disease" },
      { label: "C", text: "T3 thyrotoxicosis" },
      { label: "D", text: "Subclinical hyperthyroidism" },
    ], correct: "C",
  },
  {
    id: 136, section: "Chemical Pathology", number: 21,
    text: "Which of the following lipid abnormalities is commonly seen in hypothyroidism?",
    options: [
      { label: "A", text: "Elevated total cholesterol and LDL" },
      { label: "B", text: "Decreased LDL cholesterol" },
      { label: "C", text: "Hypertriglyceridemia only" },
      { label: "D", text: "Increased HDL cholesterol" },
    ], correct: "A",
  },
  {
    id: 137, section: "Chemical Pathology", number: 22,
    text: "One of the earliest signs of diabetic renal dysfunction is the:",
    options: [
      { label: "A", text: "Electrolytes imbalance" },
      { label: "B", text: "Overt albuminuria or proteinuria" },
      { label: "C", text: "Presence of microalbuminuria" },
      { label: "D", text: "Elevation of plasma creatinine" },
    ], correct: "C",
  },
  {
    id: 138, section: "Chemical Pathology", number: 23,
    text: "A sample arrives in the core lab from an outside draw station 18 hours after being obtained. The patient is a 60-year-old healthy man screened for diabetes mellitus. The sample was in a plain tube, and the result was 2.2 mmol/L. What is the most likely cause of the result?",
    options: [
      { label: "A", text: "Hyperinsulinism is likely present" },
      { label: "B", text: "Delayed analysis is the cause of the low glucose" },
      { label: "C", text: "The patient contracted his forearm repeatedly during the phlebotomy" },
      { label: "D", text: "Due to possible statin intake" },
    ], correct: "B",
  },
  {
    id: 139, section: "Chemical Pathology", number: 24,
    text: "The patient with TSH-secreting pituitary adenoma would most likely present with:",
    options: [
      { label: "A", text: "Low TSH, high free T4" },
      { label: "B", text: "High TSH, high free T4" },
      { label: "C", text: "High TSH, low free T4" },
      { label: "D", text: "Low TSH, low free T4" },
    ], correct: "B",
  },
  {
    id: 140, section: "Chemical Pathology", number: 25,
    text: "Which laboratory test result pattern indicates secondary hypothyroidism?",
    options: [
      { label: "A", text: "Low TSH, low T4" },
      { label: "B", text: "Low TSH, high T4" },
      { label: "C", text: "High TSH, low T4" },
      { label: "D", text: "High TSH, high T4" },
    ], correct: "A",
  },
  {
    id: 141, section: "Chemical Pathology", number: 26,
    text: "A patient undergoing routine lipid profile shows triglyceride level of 2.5 mmol/L (<1.7). What is the clinical implication for a diabetic patient?",
    options: [
      { label: "A", text: "No clinical concern" },
      { label: "B", text: "Predominance of small dense LDL" },
      { label: "C", text: "Indicates hyperthyroidism" },
      { label: "D", text: "High HDL" },
    ], correct: "B",
  },
  {
    id: 142, section: "Chemical Pathology", number: 27,
    text: "A 45-year-old diabetic patient has an HbA1c of 9.0%. What does this indicate about his glycemic control over the past 2–3 months?",
    options: [
      { label: "A", text: "Recent onset of diabetes" },
      { label: "B", text: "Excellent control" },
      { label: "C", text: "Poor control" },
      { label: "D", text: "Good control" },
    ], correct: "C",
  },
  {
    id: 143, section: "Chemical Pathology", number: 28,
    text: "Which of the following parameters in the standard lipid profile is not affected whether the patient is fasting or not?",
    options: [
      { label: "A", text: "Total cholesterol" },
      { label: "B", text: "HDL-cholesterol" },
      { label: "C", text: "Triglycerides" },
      { label: "D", text: "LDL-cholesterol" },
    ], correct: "A",
  },
  {
    id: 144, section: "Chemical Pathology", number: 29,
    text: "Which thyroid antibody is commonly elevated in Graves' disease?",
    options: [
      { label: "A", text: "Anti-TPO" },
      { label: "B", text: "TSH receptor antibody" },
      { label: "C", text: "Reverse T3" },
      { label: "D", text: "Anti-Tg" },
    ], correct: "B",
  },
  {
    id: 145, section: "Chemical Pathology", number: 30,
    text: "A type 2 diabetic patient presents with glucose 2.0 mmol/L, elevated insulin of 150 pmol/L and high C-peptide. What is the likely diagnosis?",
    options: [
      { label: "A", text: "Exogenous insulin overdose" },
      { label: "B", text: "Hyperthyroidism" },
      { label: "C", text: "Endogenous insulinoma" },
      { label: "D", text: "Glucagonoma" },
    ], correct: "C",
  },
  {
    id: 146, section: "Chemical Pathology", number: 31,
    text: "In thyroid function assessment, which will be your first line of test?",
    options: [
      { label: "A", text: "TSH" },
      { label: "B", text: "FT4" },
      { label: "C", text: "TBG" },
      { label: "D", text: "FT3" },
    ], correct: "A",
  },
  {
    id: 147, section: "Chemical Pathology", number: 32,
    text: "Which is a more sensitive measure of thyroid function?",
    options: [
      { label: "A", text: "TSH" },
      { label: "B", text: "T3" },
      { label: "C", text: "T4" },
      { label: "D", text: "mT3" },
    ], correct: "A",
  },
];

const PHARM: PQQuestion[] = [
  {
    id: 148, section: "Pharmacology", number: 1,
    text: "Which of the following classes of compounds stimulates the release of insulin from pancreatic B-cells?",
    options: [
      { label: "A", text: "α-Glucosidase inhibitors" },
      { label: "B", text: "Sulfonylureas" },
      { label: "C", text: "Biguanides" },
      { label: "D", text: "Thiourylenes" },
    ], correct: "B",
  },
  {
    id: 149, section: "Pharmacology", number: 2,
    text: "Levothyroxine is likely to cause the following effects EXCEPT increased:",
    options: [
      { label: "A", text: "Protein synthesis" },
      { label: "B", text: "Bradycardia" },
      { label: "C", text: "Basal metabolic rate" },
      { label: "D", text: "Oxygen utilization" },
    ], correct: "B",
  },
  {
    id: 150, section: "Pharmacology", number: 3,
    text: "Drug targets for the management of thyrotoxicosis include the: I. inhibition of organification II. reduction in the uptake of iodide III. inhibition of peripheral conversion of T4 to T3",
    options: [
      { label: "A", text: "I and II only" },
      { label: "B", text: "I only" },
      { label: "C", text: "II and III" },
      { label: "D", text: "II only" },
    ], correct: "A",
  },
  {
    id: 151, section: "Pharmacology", number: 4,
    text: "An abnormal liver function test result is possible with which of the following agents?",
    options: [
      { label: "A", text: "Troglitazone" },
      { label: "B", text: "Acarbose" },
      { label: "C", text: "Glyburide" },
      { label: "D", text: "Phenformin" },
    ], correct: "A",
  },
  {
    id: 152, section: "Pharmacology", number: 5,
    text: "Which of the following would be helpful as an adjunct to antithyroid therapy during the acute phase of thyrotoxicosis?",
    options: [
      { label: "A", text: "Methyldopa" },
      { label: "B", text: "Ipratropium" },
      { label: "C", text: "Propranolol" },
      { label: "D", text: "Radioactive iodine" },
    ], correct: "C",
  },
  {
    id: 153, section: "Pharmacology", number: 6,
    text: "This class of antithyroid drugs acts by blunting and delaying the increase in thyroid stimulating hormone (TSH) antibodies.",
    options: [
      { label: "A", text: "Corticosteroids" },
      { label: "B", text: "Barbiturates" },
      { label: "C", text: "Thioureylenes" },
      { label: "D", text: "Beta blockers" },
    ], correct: "C",
  },
  {
    id: 154, section: "Pharmacology", number: 7,
    text: "The following anions are structurally related to iodine and act as competitive inhibitors of iodine transport EXCEPT:",
    options: [
      { label: "A", text: "Permanganate" },
      { label: "B", text: "Perchlorate" },
      { label: "C", text: "Persulfate" },
      { label: "D", text: "Pertechnetate" },
    ], correct: "C",
  },
  {
    id: 155, section: "Pharmacology", number: 8,
    text: "Indications for thyroid hormones are the following, EXCEPT:",
    options: [
      { label: "A", text: "Cretinism" },
      { label: "B", text: "Myxoedema" },
      { label: "C", text: "Hashimoto's disease" },
      { label: "D", text: "Simple obesity" },
    ], correct: "D",
  },
  {
    id: 156, section: "Pharmacology", number: 9,
    text: "This drug is a noradrenergic-blocking agent used in eye drops to ameliorate the exophthalmos associated with hyperthyroidism.",
    options: [
      { label: "A", text: "Guanethidine" },
      { label: "B", text: "Prazosin" },
      { label: "C", text: "Diltiazem" },
      { label: "D", text: "Atenolol" },
    ], correct: "A",
  },
  {
    id: 157, section: "Pharmacology", number: 10,
    text: "Which of the following is true for the antithyroid drug liothyronine?",
    options: [
      { label: "A", text: "It is synthetic thyroid hormone for tetraiodothyronine (T4)" },
      { label: "B", text: "Liothyronine is converted to tetraiodothyronine in the blood" },
      { label: "C", text: "It is rarely used unless there is myxoedema coma where rapid initial response is required" },
      { label: "D", text: "The hormonal preferred drug in managing hypothyroidism" },
    ], correct: "C",
  },
  {
    id: 158, section: "Pharmacology", number: 11,
    text: "Thiocarbamides act via the following mechanism(s): I. They inhibit the iodination of tyrosyl residues in thyroglobulin and coupling of iodotyrosines II. They enhance peripheral conversion of T4 to T3 III. They inhibit synthesis by acting by facilitating iodide organification",
    options: [
      { label: "A", text: "I and II only" },
      { label: "B", text: "I and III" },
      { label: "C", text: "III only" },
      { label: "D", text: "I only" },
    ], correct: "D",
  },
  {
    id: 159, section: "Pharmacology", number: 12,
    text: "Mecasermin is a complex of recombinant human insulin-like growth factor-1 (rhIGF-I) and recombinant human insulin-like growth binding protein-3 (rhIGFBP-3).",
    options: [
      { label: "A", text: "Mecasermin rinfabate" },
      { label: "B", text: "Sermorelin acetate" },
      { label: "C", text: "Menotropins" },
      { label: "D", text: "Desmopressin acetate" },
    ], correct: "A",
  },
  {
    id: 160, section: "Pharmacology", number: 13,
    text: "Which of the following is a growth hormone antagonist developed for the treatment of acromegaly?",
    options: [
      { label: "A", text: "Pegvisomant" },
      { label: "B", text: "Lanreotide" },
      { label: "C", text: "Octreotide" },
      { label: "D", text: "Somatrem" },
    ], correct: "A",
  },
  {
    id: 161, section: "Pharmacology", number: 14,
    text: "Which of the following drugs is most likely to cause hypoglycemia when used as monotherapy in the treatment of type 2 diabetes?",
    options: [
      { label: "A", text: "Glyburide" },
      { label: "B", text: "Metformin" },
      { label: "C", text: "Rosiglitazone" },
      { label: "D", text: "Acarbose" },
    ], correct: "A",
  },
  {
    id: 162, section: "Pharmacology", number: 15,
    text: "Propylthiouracil brings the level of activated thyroid hormone down more quickly than does methimazole because it:",
    options: [
      { label: "A", text: "Inhibits iodide uptake in addition to inhibiting iodine organification" },
      { label: "B", text: "Inhibits T4 to T3 release from the thyroid gland in addition to inhibiting hormone synthesis" },
      { label: "C", text: "Inhibits the conversion of T4 to T3 in addition to inhibiting iodine organification" },
      { label: "D", text: "Facilitates the excretion of thyroid hormones much more than methimazole" },
    ], correct: "C",
  },
  {
    id: 163, section: "Pharmacology", number: 16,
    text: "Hypothyroidism should be treated with daily administration of which of the following thyroid hormone preparations?",
    options: [
      { label: "A", text: "Triiodothyronine (T3)" },
      { label: "B", text: "Thyroxine (T4)" },
      { label: "C", text: "Thyroglobulin" },
      { label: "D", text: "Thyroid extract" },
    ], correct: "B",
  },
  {
    id: 164, section: "Pharmacology", number: 17,
    text: "This drug is useful in the management of primary hyperaldosteronism and Cushing's syndrome and it acts by the inhibition of 3β-dehydrogenase.",
    options: [
      { label: "A", text: "Trilostane" },
      { label: "B", text: "Prednisolone" },
      { label: "C", text: "Mitotane" },
      { label: "D", text: "Metyrapone" },
    ], correct: "A",
  },
  {
    id: 165, section: "Pharmacology", number: 18,
    text: "Which of the following drugs will be most appropriate to manage a 30-year-old female with a low TSH level?",
    options: [
      { label: "A", text: "Liothyronine" },
      { label: "B", text: "Radioactive iodine" },
      { label: "C", text: "Levothyroxine" },
      { label: "D", text: "Propylthiouracil" },
    ], correct: "D",
  },
  {
    id: 166, section: "Pharmacology", number: 19,
    text: "Of the following antidiabetic agents, which is least likely to cause hypoglycemia in a type II diabetic patient?",
    options: [
      { label: "A", text: "Chlorpropamide" },
      { label: "B", text: "Insulin" },
      { label: "C", text: "Glyburide" },
      { label: "D", text: "Metformin" },
    ], correct: "D",
  },
  {
    id: 167, section: "Pharmacology", number: 20,
    text: "The following drugs are known to induce goiter EXCEPT:",
    options: [
      { label: "A", text: "Iodides" },
      { label: "B", text: "Liotrix" },
      { label: "C", text: "Lithium" },
      { label: "D", text: "Aminosalicylic acid" },
    ], correct: "B",
  },
  {
    id: 168, section: "Pharmacology", number: 21,
    text: "Which oral hypoglycemic agent could cause light-headedness, profuse sweating and a blood sugar below normal?",
    options: [
      { label: "A", text: "Glipizide" },
      { label: "B", text: "Acarbose" },
      { label: "C", text: "Pioglitazone" },
      { label: "D", text: "Metformin" },
    ], correct: "A",
  },
  {
    id: 169, section: "Pharmacology", number: 22,
    text: "All of the following can be managed using radioactive iodine EXCEPT:",
    options: [
      { label: "A", text: "Medullary cancer of the thyroid gland" },
      { label: "B", text: "Thyroid adenoma" },
      { label: "C", text: "Papillary cancer of the thyroid gland" },
      { label: "D", text: "Grave's disease" },
    ], correct: "A",
  },
  {
    id: 170, section: "Pharmacology", number: 23,
    text: "Insulin preparations that contain a modifying protein include: I. Lente insulin II. Regular insulin III. Isophane insulin (NPH)",
    options: [
      { label: "A", text: "I only" },
      { label: "B", text: "I & III only" },
      { label: "C", text: "II only" },
      { label: "D", text: "III only" },
    ], correct: "D",
  },
  {
    id: 171, section: "Pharmacology", number: 24,
    text: "Aside from insulin and oral hypoglycemic drugs, a very common drug-induced hypoglycemic state may be caused by:",
    options: [
      { label: "A", text: "Salicylates" },
      { label: "B", text: "Diuretics" },
      { label: "C", text: "Epinephrine" },
      { label: "D", text: "Glucocorticoids" },
    ], correct: "A",
  },
  {
    id: 172, section: "Pharmacology", number: 25,
    text: "Which of the following statements concerning insulin replacement therapy is most accurate?",
    options: [
      { label: "A", text: "Most commercial insulin products vary little with respect to time, course, and duration of hypoglycemic activity" },
      { label: "B", text: "Insulin therapy does not have to be monitored closely" },
      { label: "C", text: "Regular insulin cannot be given intravenously" },
      { label: "D", text: "Regulating carbohydrate consumption is a necessity for all diabetic patients" },
    ], correct: "D",
  },
  {
    id: 173, section: "Pharmacology", number: 26,
    text: "This drug acts by delivering strong beta radiations which destroys follicular cells after it has been trapped intracellularly within the thyroid gland.",
    options: [
      { label: "A", text: "Lugol's solution" },
      { label: "B", text: "Potassium iodide" },
      { label: "C", text: "Sodium iodide (I-131)" },
      { label: "D", text: "Amiodarone" },
    ], correct: "C",
  },
  {
    id: 174, section: "Pharmacology", number: 27,
    text: "Which of the following is NOT a prolactin inhibitor?",
    options: [
      { label: "A", text: "Cabergoline" },
      { label: "B", text: "Ganirelix" },
      { label: "C", text: "Bromocriptine" },
      { label: "D", text: "Pergolide" },
    ], correct: "B",
  },
  {
    id: 175, section: "Pharmacology", number: 28,
    text: "Which of the following drugs acts by inhibiting the peroxidase-catalyzed coupling of iodotyrosines to form iodothyronines?",
    options: [
      { label: "A", text: "Methimazole" },
      { label: "B", text: "Triiodothyronine" },
      { label: "C", text: "Potassium perchlorate" },
      { label: "D", text: "Radioactive iodine" },
    ], correct: "A",
  },
  {
    id: 176, section: "Pharmacology", number: 29,
    text: "Forty-year-old Kofi Mensah is suffering from primary adrenal insufficiency. He would best be treated with which of the following?",
    options: [
      { label: "A", text: "Betamethasone" },
      { label: "B", text: "Mifepristone" },
      { label: "C", text: "Misoprostol" },
      { label: "D", text: "Fludrocortisone" },
    ], correct: "D",
  },
  {
    id: 177, section: "Pharmacology", number: 30,
    text: "This antifungal drug is known to inhibit steroidogenesis.",
    options: [
      { label: "A", text: "Metronidazole" },
      { label: "B", text: "Caspofungin" },
      { label: "C", text: "Amantadine" },
      { label: "D", text: "Ketoconazole" },
    ], correct: "D",
  },
  {
    id: 178, section: "Pharmacology", number: 31,
    text: "The most important adverse effect observed with mecasermin is:",
    options: [
      { label: "A", text: "Anaphylaxis" },
      { label: "B", text: "Increased intracranial pressure" },
      { label: "C", text: "Orthostatic hypotension" },
      { label: "D", text: "Hypoglycemia" },
    ], correct: "D",
  },
  {
    id: 179, section: "Pharmacology", number: 32,
    text: "A 70-year-old diabetic with congestive heart failure is on pioglitazone. What complication is he at risk of?",
    options: [
      { label: "A", text: "Diabetic ketoacidosis" },
      { label: "B", text: "Hypokalemia" },
      { label: "C", text: "Fluid retention" },
      { label: "D", text: "Hepatic encephalopathy" },
    ], correct: "C",
  },
  {
    id: 180, section: "Pharmacology", number: 33,
    text: "How does insulin glargine differ from regular insulin? It:",
    options: [
      { label: "A", text: "Has faster onset and shorter duration" },
      { label: "B", text: "Is orally administered" },
      { label: "C", text: "Causes more hypoglycemia" },
      { label: "D", text: "Has a prolonged duration with no peak" },
    ], correct: "D",
  },
  {
    id: 181, section: "Pharmacology", number: 34,
    text: "Which of the following medications may mimic hyperparathyroidism?",
    options: [
      { label: "A", text: "Spironolactone" },
      { label: "B", text: "Lithium" },
      { label: "C", text: "Haloperidol" },
      { label: "D", text: "Metronidazole" },
    ], correct: "B",
  },
  {
    id: 182, section: "Pharmacology", number: 35,
    text: "A 35-year-old man with prostate cancer is treated with leuprolide for continuous administration. What is the expected hormonal change?",
    options: [
      { label: "A", text: "Increased GnRH" },
      { label: "B", text: "Increased estradiol" },
      { label: "C", text: "Decreased LH and FSH" },
      { label: "D", text: "Increased testosterone" },
    ], correct: "C",
  },
  {
    id: 183, section: "Pharmacology", number: 36,
    text: "Which of the following is a vitamin D analog used to treat hypocalcemia?",
    options: [
      { label: "A", text: "Bisphosphonates" },
      { label: "B", text: "Calcitriol" },
      { label: "C", text: "Denosumab" },
      { label: "D", text: "Calcitonin" },
    ], correct: "B",
  },
  {
    id: 184, section: "Pharmacology", number: 37,
    text: "A 65-year-old man with atrial fibrillation due to thyrotoxicosis is started on propranolol. Why is this drug particularly useful in hyperthyroidism?",
    options: [
      { label: "A", text: "It lowers TSH" },
      { label: "B", text: "It blocks T3 effects on the heart" },
      { label: "C", text: "It reduces T4 to T3 conversion" },
      { label: "D", text: "It inhibits thyroid hormone synthesis" },
    ], correct: "C",
  },
  {
    id: 185, section: "Pharmacology", number: 38,
    text: "A patient on canagliflozin develops recurrent urinary tract infections. What is the most likely reason?",
    options: [
      { label: "A", text: "Pancreatic stimulation" },
      { label: "B", text: "Glucosuria" },
      { label: "C", text: "Hyperkalemia" },
      { label: "D", text: "Immune suppression" },
    ], correct: "B",
  },
  {
    id: 186, section: "Pharmacology", number: 39,
    text: "A diabetic patient on glibenclamide develops confusion and sweating. What is the immediate step?",
    options: [
      { label: "A", text: "Give insulin" },
      { label: "B", text: "Check HbA1c" },
      { label: "C", text: "Start metformin" },
      { label: "D", text: "Give glucose" },
    ], correct: "D",
  },
  {
    id: 187, section: "Pharmacology", number: 40,
    text: "Which property differentiates glipizide from glibenclamide?",
    options: [
      { label: "A", text: "Glibenclamide has lower potency" },
      { label: "B", text: "Glipizide is longer acting" },
      { label: "C", text: "Glibenclamide is excreted via feces" },
      { label: "D", text: "Glipizide has a lower hypoglycemia risk" },
    ], correct: "D",
  },
  {
    id: 188, section: "Pharmacology", number: 41,
    text: "What effect does long-term lithium therapy have on thyroid function?",
    options: [
      { label: "A", text: "Stimulates TSH secretion" },
      { label: "B", text: "Increases conversion of T4 to T3" },
      { label: "C", text: "Inhibits thyroid hormone release, causing hypothyroidism" },
      { label: "D", text: "Induces hyperthyroidism" },
    ], correct: "C",
  },
  {
    id: 189, section: "Pharmacology", number: 42,
    text: "Which statement best explains the benefit of SGLT2 inhibitors in diabetic patients with cardiovascular disease?",
    options: [
      { label: "A", text: "They reduce cardiac preload" },
      { label: "B", text: "They increase myocardial contractility" },
      { label: "C", text: "They inhibit glucagon secretion" },
      { label: "D", text: "They stimulate insulin release" },
    ], correct: "A",
  },
  {
    id: 190, section: "Pharmacology", number: 43,
    text: "A patient under your care is on treatment with Carbimazole for hyperthyroidism. Which of the following symptoms, if reported by the patient, would suggest a potential severe adverse reaction to the medication?",
    options: [
      { label: "A", text: "Sore throat" },
      { label: "B", text: "Bloody diarrhoea" },
      { label: "C", text: "Recurrent headaches" },
      { label: "D", text: "Blurred vision" },
    ], correct: "A",
  },
  {
    id: 191, section: "Pharmacology", number: 44,
    text: "Which two drug classes together increase the risk of genitourinary infections?",
    options: [
      { label: "A", text: "SGLT2 inhibitors + DPP-4 inhibitors" },
      { label: "B", text: "Sulfonylureas + DPP-4 inhibitors" },
      { label: "C", text: "SGLT2 inhibitors + insulin" },
      { label: "D", text: "SGLT2 inhibitors + GLP-1 agonists" },
    ], correct: "D",
  },
  {
    id: 192, section: "Pharmacology", number: 45,
    text: "Why are DPP-4 inhibitors less likely to cause hypoglycemia compared to sulfonylureas? They:",
    options: [
      { label: "A", text: "Block glucose absorption" },
      { label: "B", text: "Enhance insulin secretion" },
      { label: "C", text: "Work independently of insulin" },
      { label: "D", text: "Are metabolized faster" },
    ], correct: "C",
  },
  {
    id: 193, section: "Pharmacology", number: 46,
    text: "Which correctly matches the mechanism of action of canagliflozin with its site of action?",
    options: [
      { label: "A", text: "GLUT-2, GIT" },
      { label: "B", text: "SGLT-2, Kidney" },
      { label: "C", text: "Na-K ATPase, Liver" },
      { label: "D", text: "K-dependent channels, Pancreas" },
    ], correct: "B",
  },
  {
    id: 194, section: "Pharmacology", number: 47,
    text: "Which differentiates alendronate from raloxifene?",
    options: [
      { label: "A", text: "Both inhibit bone resorption" },
      { label: "B", text: "Raloxifene causes jaw necrosis" },
      { label: "C", text: "Alendronate promotes osteoblast activity" },
      { label: "D", text: "Raloxifene modulates estrogen receptors" },
    ], correct: "D",
  },
  {
    id: 195, section: "Pharmacology", number: 48,
    text: "Which drug is best for treating acromegaly?",
    options: [
      { label: "A", text: "Octreotide" },
      { label: "B", text: "Leuprolide" },
      { label: "C", text: "Cabergoline" },
      { label: "D", text: "Fludrocortisone" },
    ], correct: "A",
  },
  {
    id: 196, section: "Pharmacology", number: 49,
    text: "A 33-year-old woman with newly diagnosed Graves disease is started on methimazole. Which of the following is the primary mechanism of this drug?",
    options: [
      { label: "A", text: "Inhibits thyroid peroxidase" },
      { label: "B", text: "Blocks peripheral conversion of T4 to T3" },
      { label: "C", text: "Suppresses TSH secretion from the pituitary" },
      { label: "D", text: "Inhibits iodine uptake by the thyroid" },
    ], correct: "A",
  },
  {
    id: 197, section: "Pharmacology", number: 50,
    text: "A patient with Cushing's disease is being treated with ketoconazole. What is its mechanism of action?",
    options: [
      { label: "A", text: "Inhibits ACTH secretion" },
      { label: "B", text: "Inhibits cortisol receptors" },
      { label: "C", text: "Enhances cortisol clearance" },
      { label: "D", text: "Blocks adrenal cortisol synthesis" },
    ], correct: "D",
  },
  {
    id: 198, section: "Pharmacology", number: 51,
    text: "Which combination of drugs is most likely to cause weight gain?",
    options: [
      { label: "A", text: "Metformin + DPP-4 inhibitors" },
      { label: "B", text: "GLP-1 agonists + SGLT2 inhibitors" },
      { label: "C", text: "Insulin + sulfonylureas" },
      { label: "D", text: "Metformin + acarbose" },
    ], correct: "C",
  },
  {
    id: 199, section: "Pharmacology", number: 52,
    text: "Which sulfonylurea would you choose for a patient with mild renal insufficiency?",
    options: [
      { label: "A", text: "Chlorpropamide" },
      { label: "B", text: "Glimepiride" },
      { label: "C", text: "Gliclazide" },
      { label: "D", text: "Glibenclamide" },
    ], correct: "C",
  },
  {
    id: 200, section: "Pharmacology", number: 53,
    text: "A diabetic patient on sulfonylureas experiences frequent hypoglycemia. What adjustment should be considered?",
    options: [
      { label: "A", text: "Switch to metformin" },
      { label: "B", text: "Switch to GLP-1 agonist" },
      { label: "C", text: "Add insulin" },
      { label: "D", text: "Increase sulfonylurea dose" },
    ], correct: "A",
  },
  {
    id: 201, section: "Pharmacology", number: 54,
    text: "What is the mechanism of action of sitagliptin?",
    options: [
      { label: "A", text: "α-glucosidase inhibitor" },
      { label: "B", text: "Thiazolidinedione" },
      { label: "C", text: "DPP-4 inhibitor" },
      { label: "D", text: "SGLT2 inhibitor" },
    ], correct: "C",
  },
  {
    id: 202, section: "Pharmacology", number: 55,
    text: "A patient develops pancreatitis while on antidiabetic treatment. Which drug is the most likely cause?",
    options: [
      { label: "A", text: "Metformin" },
      { label: "B", text: "Sitagliptin" },
      { label: "C", text: "Pioglitazone" },
      { label: "D", text: "Acarbose" },
    ], correct: "B",
  },
  {
    id: 203, section: "Pharmacology", number: 56,
    text: "Which antidiabetic agent stimulates insulin release from pancreatic β-cells?",
    options: [
      { label: "A", text: "Dapagliflozin" },
      { label: "B", text: "Metformin" },
      { label: "C", text: "Acarbose" },
      { label: "D", text: "Glimepiride" },
    ], correct: "D",
  },
  {
    id: 204, section: "Pharmacology", number: 57,
    text: "Which of the following explains how GLP-1 agonists promote weight loss?",
    options: [
      { label: "A", text: "Reduce appetite" },
      { label: "B", text: "Increase insulin resistance" },
      { label: "C", text: "Decrease glucagon sensitivity" },
      { label: "D", text: "Stimulate gluconeogenesis" },
    ], correct: "A",
  },
  {
    id: 205, section: "Pharmacology", number: 58,
    text: "What is the mechanism of action of pegvisomant?",
    options: [
      { label: "A", text: "GH receptor antagonist" },
      { label: "B", text: "GnRH agonist" },
      { label: "C", text: "Dopamine agonism" },
      { label: "D", text: "Somatostatin receptor agonist" },
    ], correct: "A",
  },
  {
    id: 206, section: "Pharmacology", number: 59,
    text: "A child with congenital adrenal hyperplasia is given hydrocortisone. What is the therapeutic rationale?",
    options: [
      { label: "A", text: "Stimulate adrenal cortex" },
      { label: "B", text: "Suppress ACTH" },
      { label: "C", text: "Replace aldosterone" },
      { label: "D", text: "Increase androgen levels" },
    ], correct: "B",
  },
  {
    id: 207, section: "Pharmacology", number: 60,
    text: "A 70-year-old man is diagnosed with myxedema coma. What is the immediate treatment of choice?",
    options: [
      { label: "A", text: "IV levothyroxine and hydrocortisone" },
      { label: "B", text: "PTU and potassium iodide" },
      { label: "C", text: "Oral levothyroxine and fluids" },
      { label: "D", text: "Methimazole and beta-blockers" },
    ], correct: "A",
  },
  {
    id: 208, section: "Pharmacology", number: 61,
    text: "The most common adverse effect of thioamide drugs is:",
    options: [
      { label: "A", text: "Agranulocytosis" },
      { label: "B", text: "Urticarial rash" },
      { label: "C", text: "Maculopapular pruritic rash" },
      { label: "D", text: "Lupus-like reaction" },
    ], correct: "C",
  },
  {
    id: 209, section: "Pharmacology", number: 62,
    text: "Which of the following antithyroid drugs is relatively safe and preferred in pregnancy?",
    options: [
      { label: "A", text: "Carbimazole" },
      { label: "B", text: "Methimazole" },
      { label: "C", text: "Propylthiouracil" },
      { label: "D", text: "Radioactive iodine (I-131)" },
    ], correct: "C",
  },
  {
    id: 210, section: "Pharmacology", number: 63,
    text: "Decrease of size and vascularity of the hyperplastic thyroid gland is associated with treatment with which of the following drugs?",
    options: [
      { label: "A", text: "Potassium iodide" },
      { label: "B", text: "Propranolol" },
      { label: "C", text: "Propylthiouracil" },
      { label: "D", text: "Sodium ipodate" },
    ], correct: "A",
  },
  {
    id: 211, section: "Pharmacology", number: 64,
    text: "Concerning thioamide antithyroid drugs, which of the following is NOT correct?",
    options: [
      { label: "A", text: "Long term use of thioamide drugs can lead to thyroid hyperplasia" },
      { label: "B", text: "Propylthiouracil is 10 times more potent than methimazole" },
      { label: "C", text: "Propylthiouracil is capable of inhibiting peripheral deiodination of T4 to T3" },
      { label: "D", text: "Thioamide drugs decrease thyroid hormone synthesis by inhibiting peroxidase" },
    ], correct: "B",
  },
  {
    id: 212, section: "Pharmacology", number: 65,
    text: "Vigorous management of thyroid storm may involve treatment with all of the following drugs EXCEPT:",
    options: [
      { label: "A", text: "Hydrocortisone" },
      { label: "B", text: "Metformin" },
      { label: "C", text: "Propranolol" },
      { label: "D", text: "Propylthiouracil" },
    ], correct: "B",
  },
  {
    id: 213, section: "Pharmacology", number: 66,
    text: "Which of the following is NOT iodinated contrast media?",
    options: [
      { label: "A", text: "Iopanoic acid" },
      { label: "B", text: "Pertechnetate" },
      { label: "C", text: "Diatrizoate" },
      { label: "D", text: "Ipodate" },
    ], correct: "B",
  },
  {
    id: 214, section: "Pharmacology", number: 67,
    text: "Liothyronine is not recommended for routine replacement therapy in individuals with thyroid insufficiency for the following reasons, EXCEPT which one?",
    options: [
      { label: "A", text: "It is expensive" },
      { label: "B", text: "It is less active than levothyroxine which is the preferred thyroid drug" },
      { label: "C", text: "It is more difficult to monitor its adequacy of replacement by conventional laboratory tests" },
      { label: "D", text: "It requires multiple daily doses" },
    ], correct: "B",
  },
  {
    id: 215, section: "Pharmacology", number: 68,
    text: "The following are synthetic preparations of thyroid hormones, EXCEPT:",
    options: [
      { label: "A", text: "Levothyronine" },
      { label: "B", text: "Levothyroxine" },
      { label: "C", text: "Liothyronine" },
      { label: "D", text: "Liotrix" },
    ], correct: "A",
  },
  {
    id: 216, section: "Pharmacology", number: 69,
    text: "Regular insulin differs from ultra-short acting insulin preparation in that it:",
    options: [
      { label: "A", text: "Is a clear solution at neutral pH" },
      { label: "B", text: "Is designed to control postprandial hyperglycaemia" },
      { label: "C", text: "Has a shorter duration of action" },
      { label: "D", text: "Is usually administered 2–3 times daily or more" },
    ], correct: "D",
  },
  {
    id: 217, section: "Pharmacology", number: 70,
    text: "Isophane and lente insulin preparations DO NOT share which of the following characteristics?",
    options: [
      { label: "A", text: "They are only administered subcutaneously" },
      { label: "B", text: "They are roughly equivalent in biological effects" },
      { label: "C", text: "They are used during emergencies e.g. diabetic ketoacidosis" },
      { label: "D", text: "They are usually given once or twice a day" },
    ], correct: "C",
  },
  {
    id: 218, section: "Pharmacology", number: 71,
    text: "Advantages of long acting insulins over intermediate acting preparations do NOT include which of the following?",
    options: [
      { label: "A", text: "Long acting insulins are absorbed more rapidly" },
      { label: "B", text: "Long acting insulins are safer due to reduced risk of hypoglycemia" },
      { label: "C", text: "Long acting insulins do not require re-suspension before administration" },
      { label: "D", text: "Long acting insulins produce constant circulating insulin over 24 hours without pronounced peak" },
    ], correct: "A",
  },
  {
    id: 219, section: "Pharmacology", number: 72,
    text: "Which of the following is NOT a complication that may arise from insulin therapy?",
    options: [
      { label: "A", text: "Hyperkalemia" },
      { label: "B", text: "Lipodystrophy at injection sites" },
      { label: "C", text: "Severe hypoglycemia" },
      { label: "D", text: "Weight gain" },
    ], correct: "A",
  },
  {
    id: 220, section: "Pharmacology", number: 73,
    text: "Which of the following oral hypoglycemic agents is NOT a first generation sulfonylurea?",
    options: [
      { label: "A", text: "Chlorpropamide" },
      { label: "B", text: "Glibenclamide" },
      { label: "C", text: "Tolazamide" },
      { label: "D", text: "Tolbutamide" },
    ], correct: "B",
  },
  {
    id: 221, section: "Pharmacology", number: 74,
    text: "The mode of antidiabetic action of sulfonylureas does NOT include which of the following?",
    options: [
      { label: "A", text: "Impairment of glucose absorption in the gut" },
      { label: "B", text: "Potentiation of insulin action on target tissues" },
      { label: "C", text: "Reduction of serum glucagon concentration" },
      { label: "D", text: "Release of insulin from B-cells" },
    ], correct: "A",
  },
  {
    id: 222, section: "Pharmacology", number: 75,
    text: "Which of the following will potentiate the hypoglycemic action of the sulfonylureas?",
    options: [
      { label: "A", text: "Corticosteroids" },
      { label: "B", text: "Diuretics (thiazide, furosemide)" },
      { label: "C", text: "Oral contraceptives" },
      { label: "D", text: "Sulfonamides" },
    ], correct: "D",
  },
  {
    id: 223, section: "Pharmacology", number: 76,
    text: "Which of the following is NOT CORRECT concerning meglitinides?",
    options: [
      { label: "A", text: "They are approved as a monotherapy and in combination with metformin in type 2 diabetes" },
      { label: "B", text: "They do not offer any advantage over sulfonylureas" },
      { label: "C", text: "They are not suitable on patients allergic to sulfur or sulfonylurea" },
      { label: "D", text: "They are taken three times daily and before meal" },
    ], correct: "C",
  },
  {
    id: 224, section: "Pharmacology", number: 77,
    text: "Which of the following is a short to medium acting glucocorticoid?",
    options: [
      { label: "A", text: "Fluprednisolone" },
      { label: "B", text: "Prednisolone" },
      { label: "C", text: "Triamcinolone" },
      { label: "D", text: "Dexamethasone" },
    ], correct: "B",
  },
  {
    id: 225, section: "Pharmacology", number: 78,
    text: "Anti-inflammatory and immunosuppressive actions of glucocorticoids are NOT related to which one of the following?",
    options: [
      { label: "A", text: "Decreased extravasation of leukocytes to injury" },
      { label: "B", text: "Decreased release of vasoactive and chemoattractive factors" },
      { label: "C", text: "Effect on cytokine production" },
      { label: "D", text: "Increased secretion of lipolytic and proteolytic enzymes" },
    ], correct: "D",
  },
  {
    id: 226, section: "Pharmacology", number: 79,
    text: "All the following can lead to glucocorticoid toxicity EXCEPT which one?",
    options: [
      { label: "A", text: "Continuous use at supraphysiologic doses" },
      { label: "B", text: "When taken with fatty meals" },
      { label: "C", text: "When used for adrenal suppression for more than 2 weeks" },
      { label: "D", text: "Withdrawal of therapy" },
    ], correct: "B",
  },
  {
    id: 227, section: "Pharmacology", number: 80,
    text: "Glucocorticoid therapy is NOT contraindicated in which of the following conditions?",
    options: [
      { label: "A", text: "Glaucoma" },
      { label: "B", text: "Nephrotic syndrome" },
      { label: "C", text: "Osteoporosis" },
      { label: "D", text: "Peptic ulcer disease" },
    ], correct: "B",
  },
  {
    id: 228, section: "Pharmacology", number: 81,
    text: "Dexamethasone suppression test can be used to:",
    options: [
      { label: "A", text: "Diagnose Graves disease" },
      { label: "B", text: "Differentiate between Cushing's syndrome and stress" },
      { label: "C", text: "Distinguish between rheumatoid arthritis and osteoarthritis" },
      { label: "D", text: "Diagnose phaeochromocytoma" },
    ], correct: "B",
  },
  {
    id: 229, section: "Pharmacology", number: 82,
    text: "Which one of the following is NOT a mineralocorticoid antagonist?",
    options: [
      { label: "A", text: "Drospirenone" },
      { label: "B", text: "Eplerenone" },
      { label: "C", text: "Metyrapone" },
      { label: "D", text: "Spironolactone" },
    ], correct: "C",
  },
  {
    id: 230, section: "Pharmacology", number: 83,
    text: "A 29-year-old woman takes antipsychotics and develops galactorrhea. What's the mechanism?",
    options: [
      { label: "A", text: "Dopamine receptor blockade" },
      { label: "B", text: "Excess IGF-1 activity" },
      { label: "C", text: "Increased estrogen" },
      { label: "D", text: "Negative feedback inhibition on estrogen" },
    ], correct: "A",
  },
  {
    id: 231, section: "Pharmacology", number: 84,
    text: "A 45-year-old woman presents with galactorrhea and amenorrhea. Her prolactin levels are elevated. Which of the following drugs is most appropriate?",
    options: [
      { label: "A", text: "Haloperidol" },
      { label: "B", text: "Sermorelin" },
      { label: "C", text: "Cabergoline" },
      { label: "D", text: "Ranitidine" },
    ], correct: "C",
  },
  {
    id: 232, section: "Pharmacology", number: 85,
    text: "Following treatment of Grave's disease with radio-iodine, the medication is expected to take effect and render the patient euthyroid or hypothyroid within:",
    options: [
      { label: "A", text: "One week" },
      { label: "B", text: "One year" },
      { label: "C", text: "Three months" },
      { label: "D", text: "One month" },
    ], correct: "C",
  },
];

const ANAT: PQQuestion[] = [
  {
    id: 233, section: "Anatomy & Physiology", number: 1,
    text: "The following is/are a correct matching of cellular composition of adenohypophysis: I. Acidophils — Lactotrophs II. Acidophils — Thyrotrophs III. Basophils — Gonadotrophs IV. Basophils — Somatotrophs",
    options: [
      { label: "A", text: "I and II only" },
      { label: "B", text: "I and III only" },
      { label: "C", text: "III and IV only" },
      { label: "D", text: "II and IV only" },
    ], correct: "B",
  },
  {
    id: 234, section: "Anatomy & Physiology", number: 2,
    text: "Human chorionic gonadotrophin hormone (HCG):",
    options: [
      { label: "A", text: "Acts on the uterus to maintain integrity of endometrium in early pregnancy" },
      { label: "B", text: "Can be identified in the urine of pregnant women by immunological technique" },
      { label: "C", text: "Production is greatest in the last three months of pregnancy" },
      { label: "D", text: "Is a steroid hormone" },
    ], correct: "B",
  },
  {
    id: 235, section: "Anatomy & Physiology", number: 3,
    text: "Progesterone production in the ovary is primarily by:",
    options: [
      { label: "A", text: "Corpora lutea" },
      { label: "B", text: "Corpora albicans" },
      { label: "C", text: "Mature follicles" },
      { label: "D", text: "Stroma" },
    ], correct: "A",
  },
  {
    id: 236, section: "Anatomy & Physiology", number: 4,
    text: "Which of the following is the consequence of insulin deficiency in carbohydrate metabolism?",
    options: [
      { label: "A", text: "Increased blood glucose concentration" },
      { label: "B", text: "Increased glycogen breakdown" },
      { label: "C", text: "Decreased gluconeogenesis" },
      { label: "D", text: "Decreased peripheral glucose utilization" },
    ], correct: "A",
  },
  {
    id: 237, section: "Anatomy & Physiology", number: 5,
    text: "Which of the following is the active form of thyroid hormone?",
    options: [
      { label: "A", text: "rT3" },
      { label: "B", text: "None of the other options" },
      { label: "C", text: "fT3" },
      { label: "D", text: "fT4" },
    ], correct: "C",
  },
  {
    id: 238, section: "Anatomy & Physiology", number: 6,
    text: "All the following are true about the hypothalamus EXCEPT:",
    options: [
      { label: "A", text: "All its hormones are tropic hormones" },
      { label: "B", text: "Its hormones are stored in the adenohypophysis" },
      { label: "C", text: "It plays a role in autonomic function" },
      { label: "D", text: "It synthesizes ADH and oxytocin" },
    ], correct: "B",
  },
  {
    id: 239, section: "Anatomy & Physiology", number: 7,
    text: "The inferior parathyroid gland is formed from the ______ pharyngeal pouch.",
    options: [
      { label: "A", text: "1st" },
      { label: "B", text: "2nd" },
      { label: "C", text: "3rd" },
      { label: "D", text: "4th" },
    ], correct: "C",
  },
  {
    id: 240, section: "Anatomy & Physiology", number: 8,
    text: "Which of the following is exclusively ectodermal?",
    options: [
      { label: "A", text: "Pharyngeal pouch" },
      { label: "B", text: "Pharyngeal arch" },
      { label: "C", text: "Pharyngeal gut" },
      { label: "D", text: "Pharyngeal cleft" },
    ], correct: "D",
  },
  {
    id: 241, section: "Anatomy & Physiology", number: 9,
    text: "Cold sensitivity is a characteristic of:",
    options: [
      { label: "A", text: "Hypothyroidism" },
      { label: "B", text: "Hyperthyroidism" },
      { label: "C", text: "Hypercalcemia" },
      { label: "D", text: "Hypokalemia" },
    ], correct: "A",
  },
  {
    id: 242, section: "Anatomy & Physiology", number: 10,
    text: "All the following are true about the thyroid gland EXCEPT:",
    options: [
      { label: "A", text: "It is larger in males than females" },
      { label: "B", text: "It is at the level of C2–C5 vertebrae" },
      { label: "C", text: "It is drained by the superior thyroid vein" },
      { label: "D", text: "A and B" },
    ], correct: "D",
  },
  {
    id: 243, section: "Anatomy & Physiology", number: 11,
    text: "The superior thyroid vein usually drains into the:",
    options: [
      { label: "A", text: "External jugular vein" },
      { label: "B", text: "Internal jugular vein" },
      { label: "C", text: "Subclavian vein" },
      { label: "D", text: "Brachiocephalic vein" },
    ], correct: "B",
  },
  {
    id: 244, section: "Anatomy & Physiology", number: 12,
    text: "All the following are true about parafollicular cells EXCEPT:",
    options: [
      { label: "A", text: "They secrete calcitonin" },
      { label: "B", text: "They are in contact with the lumina of the follicle" },
      { label: "C", text: "They are derived from neural crest cells" },
      { label: "D", text: "They are part of the C-cell population" },
    ], correct: "B",
  },
  {
    id: 245, section: "Anatomy & Physiology", number: 13,
    text: "Which of the following hormones uses a steroid mechanism of action?",
    options: [
      { label: "A", text: "Epinephrine" },
      { label: "B", text: "Thyroid hormone" },
      { label: "C", text: "Insulin" },
      { label: "D", text: "Glucagon" },
    ], correct: "B",
  },
  {
    id: 246, section: "Anatomy & Physiology", number: 14,
    text: "All the following group of hormones do control calcium EXCEPT:",
    options: [
      { label: "A", text: "Insulin, calcitonin, glucagon" },
      { label: "B", text: "Vitamin D, thyroid hormone, insulin" },
      { label: "C", text: "Calcitonin, vitamin D, parathyroid hormone" },
      { label: "D", text: "Epinephrine, vitamin D, calcitonin" },
    ], correct: "C",
  },
  {
    id: 247, section: "Anatomy & Physiology", number: 15,
    text: "Arrange the following steps in the action of hormones in the correct order: i. Released from gland, ii. Transportation in blood, iii. Binds to hormone receptor, iv. Site of action, v. Activation of receptor, vi. Response",
    options: [
      { label: "A", text: "i, ii, iii, iv, v, vi" },
      { label: "B", text: "i, ii, iv, iii, v, vi" },
      { label: "C", text: "ii, i, iv, iii, v, vi" },
      { label: "D", text: "i, iv, ii, iii, vi, v" },
    ], correct: "B",
  },
  {
    id: 248, section: "Anatomy & Physiology", number: 16,
    text: "The median eminence is a part of:",
    options: [
      { label: "A", text: "Neurohypophysis" },
      { label: "B", text: "Pars distalis" },
      { label: "C", text: "Pars intermedia" },
      { label: "D", text: "Pars tuberalis" },
    ], correct: "A",
  },
  {
    id: 249, section: "Anatomy & Physiology", number: 17,
    text: "The 4-ring structure of steroids can be found in:",
    options: [
      { label: "A", text: "Thyroxine" },
      { label: "B", text: "Aldosterone" },
      { label: "C", text: "Epinephrine" },
      { label: "D", text: "Adrenocorticotropic hormone" },
    ], correct: "B",
  },
  {
    id: 250, section: "Anatomy & Physiology", number: 18,
    text: "Which of the following hormones have diurnal variations in plasma levels in humans?",
    options: [
      { label: "A", text: "Calcitriol" },
      { label: "B", text: "Cortisol" },
      { label: "C", text: "Epinephrine" },
      { label: "D", text: "Thyroxine" },
    ], correct: "B",
  },
  {
    id: 251, section: "Anatomy & Physiology", number: 19,
    text: "The pituitary gland begins to develop in:",
    options: [
      { label: "A", text: "1st week" },
      { label: "B", text: "2nd week" },
      { label: "C", text: "3rd week" },
      { label: "D", text: "4th week" },
    ], correct: "D",
  },
  {
    id: 252, section: "Anatomy & Physiology", number: 20,
    text: "Insulin facilitates glucose uptake in:",
    options: [
      { label: "A", text: "Red blood cells" },
      { label: "B", text: "Skeletal muscle" },
      { label: "C", text: "Brain" },
      { label: "D", text: "Kidney tubules" },
    ], correct: "B",
  },
  {
    id: 253, section: "Anatomy & Physiology", number: 21,
    text: "Which set of hormones use the same second messenger?",
    options: [
      { label: "A", text: "Insulin and glucagon" },
      { label: "B", text: "Thyroxine and cortisol" },
      { label: "C", text: "Thyroid stimulation hormone and growth hormone" },
      { label: "D", text: "Parathyroid hormone and vasopressin" },
    ], correct: "D",
  },
  {
    id: 254, section: "Anatomy & Physiology", number: 22,
    text: "Select from the following options which is NOT a fact about the thyroid gland:",
    options: [
      { label: "A", text: "Female thyroid gland is slightly bigger than that of the male counterpart" },
      { label: "B", text: "It weighs about 15 g to 20 g" },
      { label: "C", text: "Blood is drained from it by three veins directly into internal jugular vein" },
      { label: "D", text: "Its consistent arteries are all branches of external carotid artery and thyrocervical trunk" },
    ], correct: "C",
  },
  {
    id: 255, section: "Anatomy & Physiology", number: 23,
    text: "Which of the following is NOT secreted by the thyroid gland?",
    options: [
      { label: "A", text: "Tri-iodothyronine" },
      { label: "B", text: "Thyroxine" },
      { label: "C", text: "Calcitonin" },
      { label: "D", text: "Parathyroid hormone" },
    ], correct: "D",
  },
  {
    id: 256, section: "Anatomy & Physiology", number: 24,
    text: "Using the cervical vertebra as a landmark, the thyroid gland is located at the level of:",
    options: [
      { label: "A", text: "C4–C7" },
      { label: "B", text: "C4–T1" },
      { label: "C", text: "C5–C7" },
      { label: "D", text: "C5–T1" },
    ], correct: "D",
  },
  {
    id: 257, section: "Anatomy & Physiology", number: 25,
    text: "The pituitary gland stimulates the adrenal glands to make cortisol. Cortisol is increased during all of the following situations EXCEPT:",
    options: [
      { label: "A", text: "Evening hours" },
      { label: "B", text: "Morning hours" },
      { label: "C", text: "Illness" },
      { label: "D", text: "Stress" },
    ], correct: "A",
  },
  {
    id: 258, section: "Anatomy & Physiology", number: 26,
    text: "Which of the following proteins is the main plasma binding protein for thyroid hormones?",
    options: [
      { label: "A", text: "Thyroxine binding pre-albumin" },
      { label: "B", text: "Thyroxine binding globulin" },
      { label: "C", text: "Transferrin" },
      { label: "D", text: "Caeruloplasmin" },
    ], correct: "B",
  },
  {
    id: 259, section: "Anatomy & Physiology", number: 27,
    text: "What is the role of thyroglobulin?",
    options: [
      { label: "A", text: "Transport thyroid hormones" },
      { label: "B", text: "Assist with thyroid hormone uptake" },
      { label: "C", text: "Assist with thyroid hormone production" },
      { label: "D", text: "Storage of thyroid hormones" },
    ], correct: "C",
  },
  {
    id: 260, section: "Anatomy & Physiology", number: 28,
    text: "Which of the following is NOT a glycoprotein?",
    options: [
      { label: "A", text: "LH" },
      { label: "B", text: "TSH" },
      { label: "C", text: "FSH" },
      { label: "D", text: "GH" },
    ], correct: "D",
  },
  {
    id: 261, section: "Anatomy & Physiology", number: 29,
    text: "Select the statement about the pituitary gland that is FALSE:",
    options: [
      { label: "A", text: "It relates to the splenium part of the corpus callosum inferiorly" },
      { label: "B", text: "Is part of the epithalamus" },
      { label: "C", text: "It is surrounded by cerebrospinal fluid" },
      { label: "D", text: "Medial pineal artery is a branch of anterior choroidal artery" },
    ], correct: "B",
  },
  {
    id: 262, section: "Anatomy & Physiology", number: 30,
    text: "Which of the following pair of structures relate very closely with the thyroid gland?",
    options: [
      { label: "A", text: "Internal branch of superior laryngeal nerve and external branch of superior laryngeal nerve" },
      { label: "B", text: "Recurrent laryngeal nerve and external branch of superior laryngeal nerve" },
      { label: "C", text: "Vagus nerve and external branch of superior laryngeal nerve" },
      { label: "D", text: "Vagus nerve and internal branch of superior laryngeal nerve" },
    ], correct: "B",
  },
  {
    id: 263, section: "Anatomy & Physiology", number: 31,
    text: "Which of the following stimulates insulin release?",
    options: [
      { label: "A", text: "Amino acids" },
      { label: "B", text: "Norepinephrine" },
      { label: "C", text: "Starvation" },
      { label: "D", text: "Glucagon" },
    ], correct: "A",
  },
  {
    id: 264, section: "Anatomy & Physiology", number: 32,
    text: "Which is false regarding insulin?",
    options: [
      { label: "A", text: "Promotes glycogenesis" },
      { label: "B", text: "Causes lipogenesis" },
      { label: "C", text: "Glycopeptide" },
      { label: "D", text: "Secreted by beta cells" },
    ], correct: "C",
  },
  {
    id: 265, section: "Anatomy & Physiology", number: 33,
    text: "Which of the following amino acids is the precursor for the synthesis of thyroid hormones?",
    options: [
      { label: "A", text: "Tryptophan" },
      { label: "B", text: "Alanine" },
      { label: "C", text: "Proline" },
      { label: "D", text: "Tyrosine" },
    ], correct: "D",
  },
  {
    id: 266, section: "Anatomy & Physiology", number: 34,
    text: "Most of the thyroid hormones in the blood are bound to proteins. Which of the following are NOT the thyroid hormone-binding proteins in the plasma?",
    options: [
      { label: "A", text: "Thyroglobulin" },
      { label: "B", text: "Albumin" },
      { label: "C", text: "Thyroid binding globulin" },
      { label: "D", text: "None of the other options" },
    ], correct: "A",
  },
  {
    id: 267, section: "Anatomy & Physiology", number: 35,
    text: "Calcium level affects the secretion of parathyroid hormone in a mechanism termed:",
    options: [
      { label: "A", text: "Hormonal feedback mechanism" },
      { label: "B", text: "Positive feedback mechanism" },
      { label: "C", text: "Negative feedback mechanism" },
      { label: "D", text: "Hypothalamus-pituitary axis" },
    ], correct: "C",
  },
  {
    id: 268, section: "Anatomy & Physiology", number: 36,
    text: "What is hyposecretion in relation to pituitary gland disorders?",
    options: [
      { label: "A", text: "Normal hormone secretion with no interference" },
      { label: "B", text: "Producing too much of a hormone, enhancing normal function" },
      { label: "C", text: "Growth of a tumor pressing on the brain causing pain" },
      { label: "D", text: "Producing too little of a hormone affecting normal function" },
    ], correct: "D",
  },
  {
    id: 269, section: "Anatomy & Physiology", number: 37,
    text: "Consider a situation where the hypothalamus fails to produce releasing hormones that stimulate the anterior pituitary. How would this failure likely affect the endocrine system's regulation of body functions like metabolism and growth?",
    options: [
      { label: "A", text: "The pituitary would increase production of ADH and Oxytocin to compensate for the lack of releasing hormones" },
      { label: "B", text: "The anterior pituitary would continue normal hormone secretion since it operates independently from the hypothalamus" },
      { label: "C", text: "Hormone levels regulating metabolism and growth would decrease, leading to hyposecretion effects due to lack of pituitary stimulation" },
      { label: "D", text: "There would be hypersecretion of hormones because the inhibitory signals from the hypothalamus are missing" },
    ], correct: "C",
  },
  {
    id: 270, section: "Anatomy & Physiology", number: 38,
    text: "PTH given intermittently leads to bone formation, but continuous infusion causes:",
    options: [
      { label: "A", text: "Reduced calcium levels" },
      { label: "B", text: "Increased phosphate absorption" },
      { label: "C", text: "Enhanced bone growth" },
      { label: "D", text: "Increased bone resorption" },
    ], correct: "D",
  },
  {
    id: 271, section: "Anatomy & Physiology", number: 39,
    text: "Parathyroid hormone increases calcium levels by acting on which organ?",
    options: [
      { label: "A", text: "Heart" },
      { label: "B", text: "Bone" },
      { label: "C", text: "Pancreas" },
      { label: "D", text: "Lungs" },
    ], correct: "B",
  },
  {
    id: 272, section: "Anatomy & Physiology", number: 40,
    text: "What is true about the parathyroids?",
    options: [
      { label: "A", text: "They are four in number" },
      { label: "B", text: "Located on the dorsal side of the thyroid gland" },
      { label: "C", text: "A pair of the parathyroid gland is located within the pretracheal fascia" },
      { label: "D", text: "All the other options" },
    ], correct: "D",
  },
  {
    id: 273, section: "Anatomy & Physiology", number: 41,
    text: "The secretion of aldosterone is:",
    options: [
      { label: "A", text: "Increased by the administration of spironolactone" },
      { label: "B", text: "Stimulated by a low dietary salt intake" },
      { label: "C", text: "Principally controlled by the pituitary gland" },
      { label: "D", text: "Reduced in renal artery stenosis" },
    ], correct: "B",
  },
];

export const ENDOCRINE2_SECTIONS = [
  { name: "Internal Medicine", count: 41, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { name: "Pediatrics", count: 27, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  { name: "Surgery", count: 20, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { name: "Pathology", count: 27, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { name: "Chemical Pathology", count: 32, color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-200" },
  { name: "Pharmacology", count: 85, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  { name: "Anatomy & Physiology", count: 41, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
];

export const ALL_ENDOCRINE2_QUESTIONS: PQQuestion[] = [
  ...IM, ...PED, ...SURG, ...PATH, ...CHEM, ...PHARM, ...ANAT,
];
