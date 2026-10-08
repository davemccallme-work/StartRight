/* ============================ data.js — Project Navigator V44 (ADU-first) ============================
   Static content model. Regenerated from V42 DATA and reconciled to scenarios.json v3.0.0:
     - PROJECT_TYPES reordered ADU-FIRST; ADU carries spec entry text + alias recognition.
     - GLOSSARY extended with the customer-language terminology library (terminology.json),
       so term() exposes accessible tap/click/keyboard definitions (never hover-only).
     - PREP_STATES = six preparation states — replaces readiness scoring. No %, badge, or RAG-as-score.
   Guardrails: no approval/submission language, no universal 19-day deadline, no 36-inch S1 clearance. */

/* ---- Six preparation states (NOT a score). See PREPARATION_STATE_MODEL.md. ---- */
var PREP_STATES = ["You told us","Needs confirmation","May be needed","Could affect timing","Question to ask","Recommended next action"];

/* ---- Glossary + terminology library (accessible definitions via term()). First use spells out. ---- */
var GLOSSARY = {
  "ADU type":"Whether the unit is a detached ADU, an attached ADU, or a Junior ADU (JADU). This affects whether a separate meter or service is possible.",
  "Second meter or service":"Whether the ADU needs its own meter, its own service, or both. A meter is not the same as a service.",
  "Address assignment":"Whether your project needs its own street address, which your city or county assigns.",
  "Existing service capacity":"How much power your current connection can already support.",
  "Panel capacity":"The amount of electrical demand a panel is designed to carry. A load calculation and field review help determine whether the existing panel can support planned equipment.",
  "Amperage":"A measure of electric current. Panel and main-breaker ratings are commonly shown in amps, such as 100A or 200A.",
  "Typical residential panel sizes":"Common residential main-breaker ratings include 100, 125, 150, and 200 amps. A common size does not determine what a specific project needs.",
  "Meter":"The device that measures electricity use. A meter is different from the electrical service connection and from the electrical panel.",
  "Electrical panel":"The equipment that distributes electricity to circuits in a building and contains breakers, including the main breaker.",
  "Overhead service":"An electrical service path where visible wires typically reach the property from a pole.",
  "Underground service":"An electrical service path that reaches the property below ground rather than through visible overhead wires.",
  "Load calculation":"A code-based calculation of expected electrical demand. A licensed electrician can use it to evaluate whether planned equipment may fit the existing panel and service.",
  "Service upgrade":"A change to the electrical connection or capacity serving the property. It is not the same as replacing only the electrical panel.",
  "Electrical load":"The total amount of power the added equipment will draw at once.",
  /* customer-language terminology library */
  "Accessory Dwelling Unit (ADU)":"A separate, self-contained living space on the same property as a main home. Sometimes called a granny unit, in-law unit, backyard cottage, or second unit.",
  "Junior Accessory Dwelling Unit (JADU)":"A smaller unit created within the existing home. It is treated like an attached ADU only if it meets the complete-family-living-facilities test.",
  "Authority Having Jurisdiction (AHJ)":"The local city or county office that assigns addresses and approves permits for your project.",
  "meter":"The device that measures how much electricity your property uses. A meter is not the same as a service.",
  "electrical service":"The connection that brings power from PG&E to your property. Adding a meter does not always mean adding a service.",
  "service lateral":"The wire that carries power from PG&E's line to your meter or panel.",
  "electric panel":"The box that distributes power to the circuits in your home and holds the breakers.",
  "amp (amperage)":"A measure of how much electricity your service or panel can carry at once \u2014 for example, 100A or 200A.",
  "main breaker":"The large switch in your panel that controls all power to the home. Its rating (in amps) tells you your panel size.",
  "like-for-like replacement":"Replacing a panel with the same capacity, not increasing it. Going from under 100A to a new 100A is like-for-like, not an upgrade.",
  "panel upgrade":"Replacing a panel with a higher-capacity one so your service can carry more electricity.",
  "load sheet":"A form listing your equipment and expected power use, so the added load can be evaluated. Usually completed with a contractor or electrician.",
  "site plan":"A drawing or aerial view of your property showing where the meter is, with a north arrow and street names.",
  "exterior elevation plan":"A scaled drawing of the outside wall of the building with the meter location marked.",
  "single-line diagram (SLD)":"A simple diagram showing how power flows from the service to your equipment. Usually prepared by an electrician.",
  "panel cut sheet":"The manufacturer spec sheet (or a clear photo of the rating label) that shows the panel's maximum rating.",
  "unique address":"A separate street address assigned by your city or county \u2014 sometimes required before a second meter or service can be set.",
  "clearance":"The required space around equipment so it is safe and accessible. Not meeting clearances can turn a project into a relocation.",
  "formal review":"The official PG&E application and review process. Project Navigator is before this step \u2014 it does not start, submit, or approve anything."
};

/* ---- §3 Source authority classification (execution plan). Non-scored governance/audit metadata.
   Three roles govern *which source wins* when guidance is assembled — this is provenance, NOT a score. ---- */
var SOURCE_ROLES = {
  product_behavior_authority: {label:"Product rule", badge:"sourced",       desc:"Governs how this tool behaves (thresholds, guardrails). Cannot be overridden by explanatory sources."},
  scenario_logic_authority:   {label:"Scenario logic", badge:"sourced",     desc:"Governs routing and eligibility (LSP / ExC). Specifics still confirmed with PG&E."},
  explanatory_support:        {label:"Explanatory", badge:"illustrative",   desc:"Shapes explanation only. Never sets requirements or thresholds."}
};
function sourceRole(id){return SOURCE_ROLES[id]||SOURCE_ROLES.explanatory_support;}

/* ---- Evidence provenance per confirmation item — drives the .ebadge chip (customer/interpretation/illustrative/sourced). ---- */
var CONFIRM_PROVENANCE = {
  "ADU type":"sourced",              // AIM Journey Map eligibility screening
  "Second meter or service":"sourced",
  "Address assignment":"sourced",    // unique AHJ address gate
  "Existing service capacity":"interpretation",
  "Panel capacity":"interpretation",
  "Electrical load":"interpretation"
};
function confirmProvenance(l){return CONFIRM_PROVENANCE[l]||"interpretation";}

var CONFIRM_META = {
  "ADU type":{who:"Your city or county planning office, and a contractor",ask:"Is my unit a detached ADU, an attached ADU, or a Junior ADU (JADU)?",why:"The ADU type affects which meter and service questions need review. Under Electric Rule 18, a JADU cannot be separately metered and is not required to have a separate address. This metering rule does not by itself determine whether another service connection is available."},
  "Second meter or service":{who:"PG&E and your city or county",ask:"Does my ADU need its own meter, its own service, or both?",why:"A meter is not the same as a service. Whether a second service is allowed depends on the ADU type and, for attached units, on whether the AHJ requires it."},
  "Address assignment":{who:"Your city or county planning office",ask:"Does this project need its own separate (unique) address?",why:"A unique address can gate a second meter or service and affect permit and service sequencing."},
  "Existing service capacity":{who:"PG&E or your contractor",ask:"Can my current service support the added unit or load?",why:"If it can't, upgrades may be required before the project can proceed."},
  "Panel capacity":{who:"Your licensed electrician or contractor",ask:"Can my existing panel and service support this after a load calculation?",why:"A larger panel should not be assumed before the actual load and code-compliant alternatives are reviewed."},
  "Electrical load":{who:"Your licensed electrician or contractor",ask:"Please calculate my expected load using the applicable code method.",why:"A load calculation can show whether the planned equipment fits the existing service before anyone assumes a larger panel is required."}
};
function confirmMeta(l){return CONFIRM_META[l]||{who:"the appropriate source",ask:"What applies to my project?",why:"Confirming this reduces the chance of a later surprise."};}

/* ---- PROJECT_TYPES: ADU-FIRST. entry = spec entry text; aliases = single recognition vocabulary source. ---- */
var PROJECT_TYPES = [
  {id:"adu",title:"Accessory Dwelling Unit (ADU)",subtitle:"Add a separate living space (granny, in-law, backyard, second unit)",entry:"Accessory Dwelling Unit (ADU), sometimes called granny unit, in-law unit, backyard cottage, second unit",icon:"home",anchor:true,aliases:["adu","accessory dwelling unit","jadu","junior adu","granny unit","granny flat","in law","in-law unit","mother in law","backyard cottage","cottage in the backyard","second unit","second home","guest house","casita","garage conversion","rental unit","additional unit","second meter","separate meter","meter for my adu","separate service for unit"]},
  {id:"panel",title:"Panel Upgrade",subtitle:"Upgrade an electric panel or increase capacity",entry:"Upgrade an electric panel",icon:"gauge",cohort:"B",aliases:["panel upgrade","service upgrade","bigger panel","more power","200 amp","200-amp panel","upgrade my panel","main panel","increase capacity","increase panel capacity","electrical capacity","replace my panel","breaker box","fuse box"]},
  {id:"ev",title:"EV Charger",subtitle:"Charge an electric vehicle at home",icon:"zap",aliases:["ev","electric vehicle","car charger","ev charger","home charging","charge my car","charging station","tesla charger","level 2 charger","plug in my car","wall charger"]},
  {id:"solar",title:"Solar + Battery",subtitle:"Generate or store energy",icon:"sun",aliases:["solar","solar panels","solar and battery","battery backup","powerwall","home battery","store energy","go solar","photovoltaic","rooftop solar"]},
  {id:"remodel",title:"Remodel",subtitle:"Update or expand your home",icon:"wrench",aliases:["remodel","renovation","kitchen remodel","bathroom remodel","add a room","home addition","expand my house","rewire","new appliances","addition"]},
  /* P1-B: New Electric Service = distinct illustrative-only card (absent from DEEP_SCENARIOS). */
  {id:"new_service",title:"New Electric Service",subtitle:"Set up a brand-new electric service connection",entry:"New electric service connection",icon:"zap",aliases:["new electric service","new service connection","brand new service","set up new service"]},
  {id:"unsure",title:"I'm not sure yet",subtitle:"Help me clarify the project",icon:"circle-help",aliases:[]}
];

var QUESTIONS = [
  {id:"description",label:"What would you like to do at your property?",why:"Your description helps us understand the goal before asking about utility details.",type:"textarea",placeholder:"For example: I want to build an ADU for my mom.",examples:["Build an ADU for family","Add a second meter for a backyard unit","Upgrade my electric panel","Not sure \u2014 just exploring"]},
  {id:"property",label:"What type of property is this project for?",why:"Some utility considerations differ by property type.",type:"choices",options:["Single-family home","Multi-family property","Commercial property","Not sure"]},
  {id:"energy",label:"Which of these sounds most like what you need?",helper:"Choose the closest answer. It is okay not to know yet.",why:"This helps identify whether service capacity or utility review may need to be discussed.",type:"choices",options:["A separate meter or service","More electrical capacity","New electric service","Not sure yet"]},
  {id:"timing",label:"Where are you with your project today?",why:"Your stage helps us suggest an appropriate next conversation, without committing you to an application.",type:"choices",options:["Just exploring","Talking with a contractor","Working on permits","Ready to begin soon"]}
];
/* ADU-only clarification. It is inserted after the customer's own description and is
   never shown for other project types. The visuals explain physical relationships only. */
var ADU_TYPE_QUESTION={
  id:"aduType",
  label:"What type of unit are you adding?",
  helper:"Choose the closest answer. If the type has not been confirmed, choose I’m not sure.",
  why:"The unit type helps identify which address, meter, and service questions may need confirmation. Your choice is not an eligibility or approval determination.",
  type:"choices",
  variant:"illustrated",
  appliesTo:["adu"],
  options:[
    {value:"Detached ADU",title:"Detached ADU",desc:"A separate structure from the main home.",illustration:"detached"},
    {value:"Attached ADU",title:"Attached ADU",desc:"A unit physically connected to the main home.",illustration:"attached"},
    {value:"Junior ADU",title:"Junior ADU",desc:"A smaller unit created within the main home.",illustration:"junior"},
    {value:"I’m not sure",title:"I’m not sure",desc:"Choose this if the unit type has not been confirmed.",illustration:"unsure"}
  ]
};
/* Panel-only clarification. It identifies the customer's stated intent; it does not
   determine whether a capacity increase or utility service change is required. */
var ADU_ADDRESS_STATUS_QUESTION={
  id:"aduAddressStatus",
  label:"Has your city or county assigned a separate address for the unit?",
  helper:"Choose the closest answer. An address alone does not determine whether a separate meter or service applies.",
  why:"Address evidence can affect second-meter or second-service preparation, but PG&E and your city or county still need to confirm the applicable arrangement.",
  type:"choices",variant:"compact",appliesTo:["adu"],
  options:[
    {value:"Yes, a separate address is assigned",title:"Yes, a separate address is assigned",desc:"You have an approved address from your city or county."},
    {value:"The address request is in progress",title:"The address request is in progress",desc:"Your city or county has not completed the assignment."},
    {value:"No separate address is assigned",title:"No separate address is assigned",desc:"No separate address has been issued for the unit."},
    {value:"I’m not sure",title:"I’m not sure",desc:"Keep the address evidence under Needs confirmation."}
  ]
};
var ADU_METER_SERVICE_INTENT_QUESTION={
  id:"aduMeterServiceIntent",
  label:"What electrical setup are you considering for the unit?",
  helper:"Choose the closest answer. This describes what you are considering, not what is eligible, required, or approved.",
  why:"A second meter, a second service connection, and added load on existing service are different paths. PG&E and your city or county still need to confirm what applies.",
  type:"choices",variant:"compact",appliesTo:["adu"],
  options:[
    {value:"Use the existing meter and service",title:"Use the existing meter and service",desc:"The unit would share the existing electrical service setup."},
    {value:"Add a separate meter",title:"Add a separate meter",desc:"You are considering separate measurement of electricity use."},
    {value:"Add a separate service connection",title:"Add a separate service connection",desc:"You are considering another connection from the PG&E system."},
    {value:"I’m not sure",title:"I’m not sure",desc:"Keep the meter and service arrangement under Needs confirmation."}
  ]
};
var ADU_SERVICE_METHOD_QUESTION={id:"aduServiceMethod",label:"If a separate electrical path is considered, would it be overhead or underground?",helper:"Choose the closest answer. This does not determine whether a separate meter or service applies.",why:"Overhead and underground paths can call for different photos and site information.",type:"choices",variant:"compact",appliesTo:["adu"],options:[{value:"Overhead",title:"Overhead",desc:"Visible wires typically reach the property from a pole."},{value:"Underground",title:"Underground",desc:"The route would be below ground."},{value:"I’m not sure",title:"I’m not sure",desc:"Keep service-method guidance under Needs confirmation."}]};
var ADU_ADJACENT_SERVICE_QUESTION={id:"aduAdjacentService",label:"Would new service equipment be next to existing service equipment?",helper:"Choose the closest answer. This only helps identify whether existing-service photos may be useful.",why:"Existing-service photos are conditional when proposed service equipment would be adjacent to existing service equipment.",type:"choices",variant:"compact",appliesTo:["adu"],options:[{value:"Yes, next to existing equipment",title:"Yes, next to existing equipment"},{value:"No, not next to existing equipment",title:"No, not next to existing equipment"},{value:"I’m not sure",title:"I’m not sure"}]};
var PANEL_INTENT_QUESTION={
  id:"panelIntent",
  label:"What are you planning to do with the electrical panel?",
  helper:"Choose the closest answer. A licensed electrician can help confirm the scope.",
  why:"A capacity increase, like-for-like replacement, and relocation can lead to different preparation questions. Your answer is a starting point, not a technical determination.",
  type:"choices",
  variant:"compact",
  appliesTo:["panel"],
  /* P1-A: customer label changed; stored VALUE unchanged so all logic keys keep working. */
  options:[
    {value:"Increase the panel capacity",title:"Increase panel amperage/capacity"},
    "Replace the panel at the same capacity",
    {value:"Add electrical equipment; panel change not decided",title:"Add electrical equipment",desc:"You are planning new equipment but have not decided whether the panel needs to change."},
    "Relocate the panel",
    "I’m not sure"
  ]
};
function panelIntentDisplay(v){return v==="Increase the panel capacity"?"Increase panel amperage/capacity":(v||"");}
var PANEL_EXISTING_CAPACITY_QUESTION={
  id:"panelExistingCapacity",
  label:"What is the main breaker rating on the existing panel?",
  helper:"Use an existing label or photo if available. Do not remove the panel cover.",
  why:"The main breaker rating helps an electrician understand the current starting point. It does not show by itself whether the panel or service can support the project.",
  type:"choices",variant:"compact",appliesTo:["panel"],
  options:["Less than 100 amps","100 amps","125 amps","150 amps","200 amps","More than 200 amps","I’m not sure"]
};
var PANEL_SERVICE_METHOD_QUESTION={
  id:"panelServiceMethod",
  label:"How does electric service reach the property?",
  helper:"Choose the closest answer. If you are unsure, keep the overhead photo examples under Needs confirmation.",
  why:"Overhead and underground service can call for different photos and site questions. This answer only tailors preparation guidance.",
  type:"choices",variant:"compact",appliesTo:["panel"],
  options:[
    {value:"Overhead service",title:"Overhead service",desc:"Visible wires typically reach the property from a pole."},
    {value:"Underground service",title:"Underground service",desc:"The service route is not visible overhead."},
    {value:"I’m not sure",title:"I’m not sure",desc:"Keep service-method guidance conditional until it is confirmed."}
  ]
};
var PANEL_PROPOSED_CAPACITY_QUESTION={
  id:"panelProposedCapacity",
  label:"What capacity are you considering?",
  helper:"Choose the closest answer if a capacity has been discussed. This does not mean that size is needed or available.",
  why:"Comparing the current rating with a proposed rating helps frame questions for a licensed electrician and PG&E without deciding the design.",
  type:"choices",variant:"compact",appliesTo:["panel"],
  options:["100 amps","125 amps","150 amps","200 amps","320 amps","400 amps or more","I’m not sure"]
};
var PANEL_LOAD_QUESTION={
  id:"panelLoads",
  label:"What equipment or electrical load are you planning to add?",
  helper:"Select all that apply. Choose No added equipment or I’m not sure by itself.",
  why:"The equipment list gives a licensed electrician the starting information for a code-based load calculation. It does not determine whether a panel or service upgrade is required.",
  type:"multichoice",variant:"compact",appliesTo:["panel"],
  exclusiveOptions:["No added equipment","I’m not sure"],
  options:["EV charger","Heat pump or electric HVAC","Electric water heater","Electric range or cooking equipment","Solar or battery","Other electrical equipment","No added equipment","I’m not sure"]
};
var PANEL_CAPACITY_COMPARE_QUESTION={
  id:"panelCapacityCompare",
  label:"Compare your existing and proposed panel size",
  helper:"Set each value on its own. If a value hasn’t been confirmed, choose “I’m not sure” — changing one does not change the other.",
  why:"Seeing the existing rating next to the capacity you’re considering helps frame questions for a licensed electrician and PG&E. The proposed size is not approved or necessarily required; a load calculation and review determine what actually applies.",
  type:"panelCompare",variant:"compact",appliesTo:["panel"],
  fields:[
    {id:"panelExistingCapacity",legend:"Existing main breaker rating (today)",options:["Less than 100 amps","100 amps","125 amps","150 amps","200 amps","More than 200 amps","I’m not sure"]},
    {id:"panelProposedCapacity",legend:"Capacity being considered (proposed — not approved or required)",options:["100 amps","125 amps","150 amps","200 amps","320 amps","400 amps or more","I’m not sure"]}
  ]
};
var QUESTION_TOPIC_ORDER=["Property context","Project context","Service context","Panel context","Load context","Preparation context","Guidance"];
var QUESTION_TOPIC_BY_ID={
  property:"Property context",description:"Project context",aduType:"Project context",panelIntent:"Project context",
  aduAddressStatus:"Property context",aduMeterServiceIntent:"Service context",aduServiceMethod:"Service context",aduAdjacentService:"Service context",panelServiceMethod:"Service context",
  panelExistingCapacity:"Panel context",panelCapacityCompare:"Panel context",panelProposedCapacity:"Panel context",
  panelLoads:"Load context",energy:"Load context",timing:"Preparation context"
};
function questionTopic(q){return QUESTION_TOPIC_BY_ID[(q&&q.id)||""]||"Guidance";}
function questionsForProject(projectType){
  var shared=QUESTIONS.filter(function(q){return q.id!=="description";}),byId={};shared.forEach(function(q){byId[q.id]=q;});
  var list=[];
  function add(q){if(q&&list.indexOf(q)<0)list.push(q);}
  add(byId.property);
  if(projectType==="adu"){
    add(ADU_TYPE_QUESTION);add(ADU_ADDRESS_STATUS_QUESTION);add(ADU_METER_SERVICE_INTENT_QUESTION);add(ADU_SERVICE_METHOD_QUESTION);add(ADU_ADJACENT_SERVICE_QUESTION);add(byId.energy);add(byId.timing);
  }else if(projectType==="panel"){
    add(PANEL_INTENT_QUESTION);add(PANEL_SERVICE_METHOD_QUESTION);
    var increasing=S&&S.answers&&S.answers.panelIntent==="Increase the panel capacity";
    add(increasing?PANEL_CAPACITY_COMPARE_QUESTION:PANEL_EXISTING_CAPACITY_QUESTION);
    add(PANEL_LOAD_QUESTION);add(byId.energy);add(byId.timing);
  }else{
    add(QUESTIONS.filter(function(q){return q.id==="description";})[0]);add(byId.energy);add(byId.timing);
  }
  return list;
}
var GUIDANCE = {
  adu:{sourceRole:"scenario_logic_authority",recommendation:"Confirm your ADU type and whether it needs a separate address before planning metering.",why:"ADU type and address status affect which meter and service questions need confirmation. Under Electric Rule 18, a JADU cannot be separately metered and is not required to have a separate address. A meter is not the same as a service, and this metering rule does not by itself determine whether another service connection is available.",owner:"You, with your city or county",after:"Then discuss the ADU's electrical needs with your contractor, and only look at a panel upgrade if capacity actually needs to increase.",known:"ADU project",confirmations:["Address assignment","ADU type","Second meter or service","Existing service capacity"],timeline:["Address assignment","Permit sequencing","Possible service upgrade"],questions:["Is this a detached ADU, attached ADU, or JADU?","Does the ADU need its own address before a second meter or service?","Does it need a separate meter, a separate service, or both?","Will the existing service support the ADU, or does capacity need to increase?"],next:["Confirm the ADU type and address requirement","Contact PG&E to confirm whether any separate metering or service arrangement applies","Gather the site plan, elevation, and load sheet","Decide when to begin an application"]},
  panel:{sourceRole:"scenario_logic_authority",recommendation:"Confirm this is an upgrade (not a like-for-like replacement), then ask for a load calculation before deciding to replace the panel.",why:"Going from under 100A to a new 100A is a like-for-like replacement, not an upgrade. Where more capacity is needed, an electrician may consider right-sized equipment, managed charging, or a smart panel before recommending a larger service.",owner:"You and a licensed electrician",after:"Then confirm permitting, equipment approval, and whether PG&E needs to review any service change.",known:"Possible panel or service-capacity project",confirmations:["Electrical load","Panel capacity","Existing service capacity"],timeline:["Load calculation","Alternatives and code review","Equipment availability","Utility review if a service change is needed"],questions:["Is this a true upgrade or a like-for-like replacement?","What does the load calculation show?","Could right-sized equipment or automatic load management work here?","Would the proposed design require PG&E review?"],next:["Confirm upgrade vs. like-for-like","List the equipment you plan to add","Get a code-based load calculation","Compare keep-the-panel options with an upgrade"]},
  ev:{sourceRole:"scenario_logic_authority",recommendation:"Start with the charging you need, then ask an electrician whether the existing panel can support it.",why:"The fastest charger is not always necessary. Right-sizing charging speed or using managed charging may reduce added demand, but an electrician must confirm the design and code compliance.",owner:"You and a licensed electrician",after:"Then compare a keep-the-panel design with an upgrade and confirm whether PG&E involvement is needed.",known:"EV charger project",confirmations:["Panel capacity","Electrical load","Existing service capacity"],timeline:["Charging-needs decision","Load calculation","Installation planning"],questions:["How many miles of charge do I need overnight?","Can managed charging keep the project within existing capacity?"],next:["Define your charging need","Get a load calculation","Compare charger and load-management options"]},
  solar:{sourceRole:"explanatory_support",recommendation:"Discuss your solar and battery sizing with a qualified contractor.",why:"System size and existing service capacity shape the questions you may need to bring to PG&E.",owner:"You and a qualified contractor",after:"Then review whether your existing service and interconnection needs are clear.",known:"Solar + battery project",confirmations:["Existing service capacity","Electrical load"],timeline:["Equipment selection","Interconnection review","Permit timing"],questions:["What system size fits my goals?","Can my current service support it?"],next:["Clarify system goals","Discuss sizing","Review existing service"]},
  remodel:{sourceRole:"explanatory_support",recommendation:"Identify the new electrical or gas needs created by your remodel.",why:"A remodel may change load, service, or equipment requirements even when the utility connection looks unchanged.",owner:"You and your contractor",after:"Then confirm whether existing service needs to change.",known:"Remodel project",confirmations:["Electrical load","Panel capacity","Existing service capacity"],timeline:["Equipment decisions","Permit sequencing","Possible service changes"],questions:["What new equipment will be added?","Will the remodel increase electrical load?"],next:["List new equipment","Discuss likely load","Confirm service changes"]},
  unsure:{sourceRole:"explanatory_support",recommendation:"Describe the change you want to make to your property.",why:"Starting with your goal lets us ask only the questions needed to clarify possible utility involvement.",owner:"You",after:"Then we can identify who may need to confirm the next detail.",known:"Project goal is still being clarified",confirmations:["Electrical load","Existing service capacity"],timeline:["Project scope","Permit needs","Possible service changes"],questions:["What am I hoping to change?","Who can help confirm the technical details?"],next:["Describe your goal","Identify missing details","Confirm who can answer them"]}
};

var DECISIONS = [
  {id:"adu-type",title:"ADU type and metering",icon:"home",signal:"Needs confirmation",cls:"amber",appliesTo:["adu"],decision:"Is this a detached ADU, an attached ADU, or a JADU \u2014 and does it need a separate meter, a separate service, or both?",delay:"Metering and service eligibility can change permits and service planning if confirmed late.",action:"Confirm the ADU type with your city or county, and ask PG&E whether a second meter or service applies. Remember a meter is not the same as a service."},
  {id:"address",title:"Address requirement",icon:"map-pin",signal:"Needs confirmation",cls:"amber",appliesTo:["adu","remodel"],decision:"Does the project require a new or separate (unique) address?",delay:"A unique address can gate a second meter or service.",action:"Confirm with your city or county planning office whether a separate address is required."},
  {id:"panel-options",title:"Before replacing the panel",icon:"gauge",signal:"Do this before choosing",cls:"amber",appliesTo:["adu","solar","panel","ev","remodel","unsure"],decision:"Does the load calculation show that a larger panel or service is necessary, or could a code-compliant alternative fit the need?",delay:"Ordering equipment before the design is confirmed can create rework.",action:"Ask a licensed electrician to compare the current-panel option, right-sized equipment, managed charging, and a smart panel. Confirm permits and utility involvement before deciding."},
  {id:"utility",title:"Utility requirements",icon:"zap",signal:"Could affect timing",cls:"rose",appliesTo:["adu","solar","panel","ev","remodel","unsure"],decision:"Will the project need new service, added capacity, or a gas change?",delay:"Unclear service needs can slow design decisions.",action:"Discuss likely energy needs with your contractor before finalizing the design."},
  {id:"timing",title:"Project timing",icon:"clock",signal:"Confirm timing",cls:"sky",appliesTo:["adu","solar","panel","ev","remodel","unsure"],decision:"When should PG&E become involved?",delay:"Permit, address, design, and utility timing may not line up.",action:"Clarify target dates and the earliest dependency, then plan the PG&E conversation around it."}
];

var TOPICS = ["Your project","A few questions","What needs confirming","Questions before you begin","Your next action"];
var TOPIC_PURPOSE = ["describe what you are planning","answer a few clarifying questions","see what is known and what needs confirming","review questions worth checking before you begin","review your recommended next action"];

var TIMING_DESC = {
  "Address assignment":"Whether a separate (unique) address is required can affect when permits and service planning move forward, and can gate a second meter or service.",
  "Permit sequencing":"The order in which permits are issued can influence when work is able to begin.",
  "Possible service upgrade":"If an upgrade turns out to be needed, added engineering and construction steps can affect timing.",
  "Load calculation":"Waiting on a code-based load calculation can hold up design decisions.",
  "Alternatives and code review":"Comparing options and confirming code acceptance takes time before a choice is made.",
  "Equipment availability":"Lead times for panels or other equipment can affect scheduling.",
  "Utility review if a service change is needed":"If service changes, PG&E review adds steps before construction can proceed.",
  "Charging-needs decision":"Deciding your charging needs first shapes the rest of the plan and its timing.",
  "Installation planning":"Coordinating the installation with permits and inspections can affect timing.",
  "Equipment selection":"Choosing equipment can shape what review is required and when it happens.",
  "Interconnection review":"Interconnection review is a common source of timing surprises for solar and battery projects.",
  "Permit timing":"Local permit review times vary and can shift your start date.",
  "Equipment decisions":"Final equipment choices can change load, service, or permit needs later.",
  "Possible service changes":"If service has to change, added review and coordination can affect timing.",
  "Project scope":"Changes to scope can increase review time if requirements or equipment needs evolve.",
  "Permit needs":"Local city and county permit requirements can influence when work can begin."
};
function timingDesc(l){return TIMING_DESC[l]||"This step may need additional discussion, permits, or utility review depending on your project.";}

/* ============================================================================
   D-007 CAPABILITY BLOCKS — append to the ADU-first V44 data.js
   Source: V42 data.js (donor). Merged verbatim EXCEPT where noted.
   The ADU-first spine (GLOSSARY, PROJECT_TYPES, QUESTIONS, GUIDANCE, DECISIONS,
   CONFIRM_META, SOURCE_ROLES/sourceRole, TIMING_DESC, PREP_STATES, etc.) is
   authoritative and is NOT duplicated here.

   EXCLUDED as duplicate spine (baseline wins): GLOSSARY, CONFIRM_META/confirmMeta,
   PROJECT_TYPES, QUESTIONS, GUIDANCE, DECISIONS, TOPICS, TOPIC_PURPOSE, TIMING_DESC,
   timingDesc, SOURCE_ROLES, sourceRole, GUIDANCE_SOURCE_ROLE + its IIFE
   (baseline GUIDANCE already carries sourceRole inline).

   ⚑ RESOLVED D-007-docwindow (team decision 2026-09-02): the baseline prohibits a *universal*
   19-day deadline. The Express-connection 19-day document window is different — a journey-scoped
   SB 1210 disclosure that PROTECTS the customer by warning them before an automatic cancellation.
   It is incorporated here SCOPED to the Express path (EXPRESS_DOC_WINDOW + JOURNEYS.express_connect)
   and framed as a heads-up, never a universal clock. It does not use the prohibited universal-deadline field/rule names. See D007_MERGE_ANALYSIS.md §4.
   ============================================================================ */

/* ---- Evidence label + badge renderer ----------------------------------------------------
   ⚠ If ebadge()/EVIDENCE_LABEL is already defined in a screen module, DELETE this block to
   avoid a redeclaration. Baseline data.js does not define it; it pairs with the baseline's
   confirmProvenance() which returns the type string this renders. */
var EVIDENCE_LABEL={customer:"Your input",interpretation:"Interpretation",illustrative:"Illustrative",sourced:"PG&E source"};
function ebadge(type){return '<span class="ebadge '+type+'">'+EVIDENCE_LABEL[type]+'</span>';}

/* ============================ SB 1210 cost & timeline (REGULATED PUBLIC DISCLOSURE) ============================
   SB 1210 requires PG&E to publish average cost and timeline data for new residential service.
   Legally-required public information, AGREED IN-SCOPE. Expectation-setting, NOT a quote, estimate,
   bid, or commitment. The mandatory COST_DISCLAIMER must accompany any cost/timeline surface.
   Source: SB 1210 (electric, pub. 2025). Data-only (§7). */
var COST_DISCLAIMER="These are regulated public averages published under California SB 1210 \u2014 not a quote, estimate, or commitment. Actual cost and timing vary widely by project scope, and much of the timeline depends on customer and local-agency steps.";
var COST_TIMELINE={
  source:"SB 1210 (electric, published 2025)",
  facilities:{
    SF_1Lot:{label:"Single-family home (1 lot)",avg_cost_usd:9605,total_project_days:355},
    ADU:{label:"Accessory Dwelling Unit (ADU)",avg_cost_usd:4832,total_project_days:303},
    Duplex:{label:"Duplex (2 units)",avg_cost_usd:5795,total_project_days:346},
    DomesticWell:{label:"Residential domestic well",avg_cost_usd:5119,total_project_days:302},
    SF_2_4Lots:{label:"Single-family (2\u20134 lots)",avg_cost_usd:11153,total_project_days:377},
    CondoTownhome:{label:"Condominiums / townhomes",avg_cost_usd:44060,total_project_days:512},
    Apartments:{label:"Apartments",avg_cost_usd:29841,total_project_days:518}
  }
};
var COST_FACILITY_BY_TYPE={adu:"ADU",remodel:null,panel:null,ev:null,solar:null,unsure:null};
function costForType(pt){var key=COST_FACILITY_BY_TYPE[pt];return key?COST_TIMELINE.facilities[key]:null;}
function fmtUSD(n){return "$"+Number(n).toLocaleString("en-US");}

/* ============================ V44.40 GOVERNED COST EVIDENCE — TIER 1 / TIER 2 ============================
   Source of truth: "Residential Panel/Service Upgrades & ADUs — Evidence Synthesis" (2.3 Two-tier cost
   evidence hierarchy) + V44.23+ guardrails. Purpose: give customers grounded cost CONTEXT for panel
   projects (which have no SB 1210 facility record) without inventing a number.

   GOVERNANCE (enforced here and by tests):
   - Tier 1 (PG&E-specific / regulated) is presented BEFORE Tier 2 and visually separated.
   - Tier 2 (external benchmarks) is ALWAYS labeled "Not PG&E pricing. Actual project costs vary."
   - Every figure carries scope + geography + date + source-quality + a not-a-quote framing.
   - Figures are shown as LAYERED EXPOSURE, never summed into a project-specific estimate.
   - No cost-as-readiness signal; no percentages implying precision on the customer-facing band.
   Data-only (§7). */

var COST_BENCHMARK_DISCLAIMER="External benchmark ranges \u2014 not PG&E pricing, not a quote, and not a project estimate. Actual project costs vary by scope, site, and contractor. These are shown only to illustrate the kinds of costs that can apply.";

/* ---- TIER 1: PG&E-specific / regulated context (lead with this) ------------------- */
/* Engineering advance: an intake snapshot shows a possible $2,500 residential advance; cancellation
   records also show $3,500 update-service notices, plus waiver/amount-change examples. Framed as
   "may apply", never a fixed amount, per the documented currency tension. */
var COST_ENGINEERING_ADVANCE={
  label:"Possible PG&E engineering advance",
  may_apply_usd:2500,
  note:"A residential engineering advance may apply for PG&E's review. Intake materials show a possible ~$2,500 residential advance; some records show $3,500, and in some cases it is waived or changed. Treat it as \u201cmay apply,\u201d not a set amount, and not the total project cost.",
  source:"PG&E intake snapshot + cancellation records (internal; source/date to reconfirm)",
  quality:"PG&E-specific; amount and applicability vary \u2014 confirm during formal review",
  scope:"PG&E engineering review only \u2014 separate from contractor, permit, and construction costs"
};
/* CalNEXT distribution used to show VARIABILITY, not a point estimate (percentages describe a
   historical dataset, not the customer's project). */
var COST_DISTRIBUTION_CALNEXT={
  label:"How widely similar projects vary (historical)",
  points:[
    "About 20% of PG&E service-upgrade projects fell below $3,000; about 75% below $13,000.",
    "Panel-upgrade distribution points sat below $2,500 and below $10,000."
  ],
  source:"PG&E distribution via CalNEXT research (historical analytical dataset)",
  quality:"Illustrates spread; definitions and currency should be reconfirmed before reuse",
  scope:"Population-level variability \u2014 not a prediction for any one project"
};

/* ---- TIER 2: External benchmark evidence (separately labeled; illustrative only) --- */
/* Each entry: label, range_usd [low, high] (or a single illustrative pair via note), geography,
   date, quality (source-quality note), source, and a plain scope line. Ranges are STORED as data;
   no arithmetic combines them. */
var COST_TIER2_BENCHMARKS=[
  {
    id:"panel_100_to_200",
    label:"Basic 100A\u2192200A panel work",
    range_usd:[2000,6000],
    typical_usd:[2500,4000],
    geography:"Bay Area",
    date:"current (contractor-published)",
    quality:"Supplementary / moderate-low \u2014 local and relevant, but contractor-authored, not independently sampled",
    source:"Bay Area contractor listing (alphaomegaelectric.org)",
    scope:"Electrician panel work only \u2014 excludes PG&E review, permits, and any civil/trench work"
  },
  {
    id:"underground_trenching",
    label:"Underground / trenching complexity",
    illustrative_pair_usd:[5500,18500],
    geography:"Bay Area (single illustrative comparison)",
    date:"current (contractor-published)",
    quality:"Low quality for prediction \u2014 illustrates possible magnitude only, not a standard trench price",
    source:"Bay Area contractor comparison (alphaomegaelectric.org)",
    scope:"One overhead-vs-underground example where trenching and sidewalk work were involved"
  },
  {
    id:"panel_relocation",
    label:"Panel relocation",
    range_usd:[1500,3500],
    geography:"National (consumer benchmark)",
    date:"current",
    quality:"Supplementary / low local specificity \u2014 Bay Area projects may differ materially",
    source:"Angi national range (angi.com)",
    scope:"Relocation labor drivers: distance, wiring, panel type, permits, repairs"
  },
  {
    id:"labor_context",
    label:"Labor context (prevailing wage)",
    rate_usd_per_hour:{base:73.20,straight_time_total:121.50},
    geography:"Alameda County, CA",
    date:"2025 public-works determination",
    quality:"High source quality but indirect \u2014 prevailing wage for covered public work, not a residential billing rate",
    source:"CA DIR 2025-1 prevailing wage (dir.ca.gov)",
    scope:"Context for labor cost magnitude only \u2014 not a contractor quote"
  },
  {
    id:"permits",
    label:"Permit fees",
    range_usd:null,
    geography:"Oakland (example jurisdiction)",
    date:"current municipal schedule",
    quality:"High quality \u2014 official source, but project inputs are required before a fee can be calculated",
    source:"City of Oakland master fee schedule (oaklandca.gov)",
    scope:"Calculated from the current municipal schedule \u2014 no single universal electrical-upgrade fee"
  },
  {
    id:"gas_clearance_relocation",
    label:"Gas-clearance-related relocation",
    range_usd:[15000,20000],
    range_open_ended:true,
    geography:"Bay Area (narrow, MSA/solar-specific)",
    date:"2025 (policy change noted)",
    quality:"Low-to-moderate, narrow scope \u2014 solar/MSA-specific; do not generalize to ADUs or all panel changes",
    source:"Licensed Bay Area contractor (allyelectricandsolar.com)",
    scope:"Some meter/panel moves tied to gas clearance; a 2025 MSA change may remove remediation for certain pre-existing conditions"
  }
];

/* Governed accessor: returns the Tier-1 + Tier-2 cost context for a project type, or null when the
   scenario is not cost-contexted. Panel is the intended deep case (no SB 1210 facility record). */
var COST_CONTEXT_BY_TYPE={panel:true};
function costContextFor(pt){
  if(!COST_CONTEXT_BY_TYPE[pt])return null;
  return {
    projectType:pt,
    tier1:{
      sb1210_facility:costForType(pt),          /* null for panel by design */
      engineering_advance:COST_ENGINEERING_ADVANCE,
      distribution:COST_DISTRIBUTION_CALNEXT,
      disclaimer:COST_DISCLAIMER
    },
    tier2:{
      benchmarks:COST_TIER2_BENCHMARKS,
      disclaimer:COST_BENCHMARK_DISCLAIMER
    }
  };
}
/* Formatter for a stored range; NEVER used to combine two ranges. */
function fmtUSDRange(range,openEnded){
  if(!range||range.length!==2)return "";
  return fmtUSD(range[0])+"\u2013"+fmtUSD(range[1])+(openEnded?"+":"");
}


/* Journey timelines (Express vs New Project) — process expectation, SB1210/journey-sourced.
   ⚑ RESOLVED D-007-docwindow (team decision 2026-09-02): the 19-day window is RE-ENABLED, correctly
   SCOPED to the Express path only, and framed as a customer-PROTECTIVE announcement (avoid an automatic
   cancellation) — NOT a universal deadline. It is deliberately NOT named with the prohibited universal-deadline field/rule names; it lives under the Express journey where it
   actually applies. See EXPRESS_DOC_WINDOW below and §4 of the analysis. */
var JOURNEYS={
  express_connect:{label:"Express path",note:"When existing infrastructure is sufficient.",submit_to_approval_days_max:34,approval_to_energization_days_avg:66,express_doc_window_days:19},
  new_project:{label:"New Project path",note:"When new infrastructure is required.",submit_to_approval_days_max:66,pge_post_application_days_avg:182,contract_expiry_days:90}
};
/* Express-path document window (APPROVED, journey-scoped SB 1210 disclosure).
   Purpose: PROTECT the customer by announcing the window early so they don't miss it and get
   auto-cancelled. Applies ONLY on / for the Express path — never a universal clock across all
   scenarios. Data-only (§7). Not a commitment; it states a PG&E/SB1210 process rule so the customer
   can prepare in time. */
var EXPRESS_DOC_WINDOW={
  applies_to_journey:"express_connect",
  days:19,
  headline:"On the Express path, plan to submit required documents within 19 days.",
  why:"If you apply on the Express path and engineering review needs documents, PG&E generally expects them within 19 days. Missing that window can cancel the application and make you re-apply \u2014 losing your place and time.",
  protect:"This is a heads-up so you can gather documents before you apply, not a countdown we start for you. Have your site plan, load sheet, and photos ready first, then apply.",
  applies_when:"Express path only (existing infrastructure sufficient). It does not apply to every project, and it is not a universal deadline.",
  owner:"You (prepare documents) \u2014 with your contractor for the load sheet",
  next:"Assemble the document set for your scenario before applying, so the 19-day Express window is comfortable rather than tight."
};
/* Show the window only for Express-eligible situations; return null otherwise (no universal clock). */
function expressDocWindow(onExpressPath){return onExpressPath?EXPRESS_DOC_WINDOW:null;}

/* ============================ Timeline milestones & delay factors (APPROVED) ============================
   Expectation-setting for typical project timing. NOT a commitment. Data-only (§7). */
var MILESTONES=[
  {id:"describe",label:"Describe your project",who:"You",note:"Clarify goal and scope in plain language."},
  {id:"docs",label:"Gather documents",who:"You + contractor",note:"Site plan, load sheet, photos, elevation as your scenario requires."},
  {id:"address",label:"Address assignment",who:"City / county (AHJ)",note:"A separate unit may need its own street address before a meter can be set."},
  {id:"permits",label:"Permit sequencing",who:"City / county (AHJ)",note:"Permits often must be issued in a specific order before work can begin."},
  {id:"pge_review",label:"PG&E review (if service changes)",who:"PG&E",note:"New service, added capacity, or interconnection may add engineering steps."},
  {id:"energization",label:"Construction & energization",who:"PG&E + contractor",note:"Scheduling depends on scope, access, and equipment lead times."}
];
var DELAY_FACTORS=[
  {id:"address_assignment",label:"Address assignment",why:"A second unit often cannot be metered until the city or county issues a unique address. Requesting it late stalls everything downstream.",owner:"City / county (AHJ)",derisk:"Confirm early whether a separate address is required, and request it as soon as possible."},
  {id:"permit_sequencing",label:"Permit sequencing",why:"Permits frequently must be issued in a particular order; a missing or out-of-order permit pauses the project.",owner:"City / county (AHJ)",derisk:"Ask your AHJ for the required permit order before you start, and track dependencies."},
  {id:"service_upgrades",label:"Service upgrades",why:"If the existing service can't carry the new load, an upgrade adds engineering, possible equipment lead time, and PG&E review.",owner:"You + electrician + PG&E",derisk:"Get a code-based load calculation early to learn whether an upgrade is actually needed."}
];

/* Deliberate rendering focus (APPROVED): ADU + Panel DEEP; others illustrative for now. */
var DEEP_SCENARIOS={adu:true,panel:true};
function isDeepScenario(pt){return !!DEEP_SCENARIOS[pt];}
var ILLUSTRATIVE_NOTE="Additional project types will be added over time. ADU and Panel Upgrade are available now.";

/* ============================ AIM document requirements — ADU + Panel (APPROVED, deep) ============================
   From AIM ground truth. Each doc: what it is, what must be on it, why, who obtains
   (self/contractor/agency), trigger. Data-only (§7). */
var DOC_REQUIREMENTS={
  panel:{
    title:"Panel Upgrade",
    intro:"For a panel upgrade, PG&E intake looks for a baseline set of documents, plus more as the amperage or meter count rises. Bring these to your electrician and your city or county.",
    baseline:[
      {doc:"Residential load sheet",onit:"Every added appliance/equipment with make, model, and whether it's electric or gas; one sheet per meter unless meters are identical.",why:"Used to size your service and confirm the added load.",who:"contractor",trigger:"Always"},
      {doc:"Service photos",onit:"Meter close-up, the panel from at least 10 feet back, the main breaker, and the panel rating sticker if available.",why:"Shows PG&E your existing equipment and its rating.",who:"self",trigger:"Always"},
      {doc:"Overhead service photos",onit:"The weatherhead and the service span from the weatherhead to the PG&E pole/transformer.",why:"Confirms the overhead connection path.",who:"self",trigger:"Overhead service only"}
    ],
    conditional:[
      {doc:"Scaled exterior elevation plan",onit:"The building exterior with the meter location marked (a dimensioned hand drawing or photo is acceptable).",why:"Confirms where the upgraded meter will sit.",who:"contractor",trigger:"Existing 100A upgrading to 200A or greater"},
      {doc:"Panel cut sheet",onit:"The manufacturer spec sheet (or a clear photo of the rating label) showing the panel's rating.",why:"Verifies the panel's maximum rating at higher amperages.",who:"self",trigger:"320A or greater, or applicable multi-meter"},
      {doc:"Single-line diagram (SLD)",onit:"How power flows from the service to your equipment (a hand-drawn SLD is acceptable).",why:"Required for larger services and multi-meter layouts.",who:"contractor",trigger:"400A or greater, or applicable multi-meter"},
      {doc:"Building permit",onit:"The approved permit from your city or county.",why:"Required when solar is part of the project.",who:"agency",trigger:"Solar involved"},
      {doc:"Panel release from AHJ",onit:"The local jurisdiction's release/sign-off.",why:"Needed later before PG&E sets the meter.",who:"agency",trigger:"Before PG&E sets the meter"}
    ],
    reroute:"If this is really a dual-meter panel or an added ADU, use the ADU / second-meter path \u2014 the document set is different."
  },
  adu:{
    title:"ADU / second meter or service",
    intro:"For an ADU or second meter, intake first needs to know the unit type and address, then a baseline document set, plus more depending on service size and site conditions.",
    baseline:[
      {doc:"Residential load sheet",onit:"The ADU's electrical loads with make/model and fuel type.",why:"Sizes the new unit's service.",who:"contractor",trigger:"Always"},
      {doc:"Site plan / aerial view",onit:"The meter location clearly marked, plus a north arrow and street names (a Google-map aerial is acceptable).",why:"Highest-miss document \u2014 shows where the meter goes and orients the property.",who:"contractor",trigger:"Always"},
      {doc:"Scaled exterior elevation plan",onit:"The building exterior with the meter location marked (dimensioned drawing or photo acceptable).",why:"Confirms the meter placement on the structure.",who:"contractor",trigger:"Always"},
      {doc:"AHJ unique-address letter or permit",onit:"An official city/county letter or approved permit stating the unit's approved unique street address.",why:"A separate meter generally cannot be set until the unit has its own address.",who:"agency",trigger:"Second meter/service \u2014 needed before a new premise can be created"}
    ],
    conditional:[
      {doc:"Building floor plan",onit:"The unit's interior layout.",why:"Required when an internal metering room is proposed.",who:"contractor",trigger:"Internal metering room proposed"},
      {doc:"Utility / civil plan",onit:"Water, sewer, drainage, irrigation, or bioswales.",why:"Needed when those utilities aren't shown on the site plan.",who:"contractor",trigger:"Utilities not shown on the site plan"},
      {doc:"Existing-service photos",onit:"Meter close-up, panel from 10 feet back, main breaker, rating sticker.",why:"Needed when the new service sits next to existing service equipment (e.g., a multi-meter panel).",who:"self",trigger:"New service adjacent to existing equipment"},
      {doc:"Panel cut sheet",onit:"Manufacturer spec sheet or rating-label photo.",why:"Higher-amperage or multi-meter layouts.",who:"self",trigger:"320A or greater, or applicable multi-meter"},
      {doc:"Single-line diagram (SLD)",onit:"Power flow from service to equipment.",why:"Larger services and multi-meter layouts.",who:"contractor",trigger:"400A or greater, or applicable multi-meter"}
    ],
    reroute:"Detached vs. attached vs. JADU changes what's possible: a meter is not the same as a service. Confirm the unit type and address first."
  }
};

/* ============================ V44.12 PANEL SERVICE-PHOTO EXAMPLES ============================
   Canonical, synthetic, pre-application teaching content. No upload, review, scoring, or storage. */
var PANEL_PHOTO_EXAMPLES={
  id:"panel-service-photo-examples",
  title:"Example: useful service photos",
  boundary:"These synthetic examples help you recognize information that may be useful. Project Navigator has not reviewed your photos, and nothing has been uploaded, reviewed, submitted, approved, or stored.",
  safety:"Photograph only equipment and labels that are already visible. Do not touch electrical equipment or remove covers.",
  sourceId:"INT-P01",audience:"prototype-only",rightsStatus:"unknown",synthetic:true,
  baseline:[
    {id:"meter-close-up",title:"Meter close-up",include:"Show the meter and the information visible on its face.",why:"This view helps identify the existing meter.",evidence:"Confirmed guidance",sourceId:"INT-P01",alt:"Synthetic illustration of a close view of an exterior electric meter."},
    {id:"panel-context",title:"Panel and surrounding area",include:"Show the whole panel and nearby area from at least 10 feet back.",why:"This view provides context around the existing equipment.",evidence:"Confirmed guidance",sourceId:"INT-P01",alt:"Synthetic illustration of an exterior electrical panel and the surrounding wall area."},
    {id:"main-breaker",title:"Main breaker",include:"Show the main breaker only when it is already visible.",why:"The visible breaker marking can help frame a later conversation about the existing rating.",evidence:"Confirmed guidance",sourceId:"INT-P01",alt:"Synthetic illustration of a visible main breaker without an equipment cover being removed."},
    {id:"rating-sticker",title:"Panel-rating sticker",include:"Show the rating sticker when it is available and already visible.",why:"The label may provide equipment-rating information for later confirmation.",evidence:"Confirmed guidance",sourceId:"INT-P01",alt:"Synthetic illustration of a generic panel rating label with no customer identifiers."}
  ],
  overhead:[
    {id:"weatherhead",title:"Weatherhead or mast",include:"For overhead service, show the visible weatherhead or mast.",why:"This view helps show the overhead connection context.",evidence:"Confirmed guidance",sourceId:"INT-P01",alt:"Synthetic illustration of a residential overhead-service weatherhead."},
    {id:"service-span",title:"Service span",include:"For overhead service, show the visible span toward the PG&E service pole or transformer.",why:"This view helps describe the visible overhead route without determining whether it is acceptable.",evidence:"Confirmed guidance",sourceId:"INT-P01",alt:"Synthetic illustration of an overhead service span between a home and utility pole."}
  ],
  relocation:{id:"proposed-location",title:"Proposed panel location",include:"If the panel will move, show the proposed exterior location and nearby context.",why:"This supporting view can help explain the location being considered. It does not approve the location.",evidence:"Supporting context",sourceId:"INT-P04",alt:"Synthetic illustration of an exterior wall area being considered for a relocated panel."}
};

/* ============================ V44.13 ADU DOCUMENT EXAMPLES ============================
   Synthetic document coaching. Applicability remains controlled by the ADU document branch. */
var ADU_DOCUMENT_EXAMPLES={
  "Site plan / aerial view":{
    id:"adu-site-plan",title:"Examples: site plan or aerial view",evidence:"Confirmed guidance",sourceId:"INT-A01",synthetic:true,rightsStatus:"unknown",
    boundary:"These synthetic examples explain information that may be useful. Nothing has been uploaded, reviewed, submitted, approved, or stored.",
    examples:[
      {id:"site-plan",title:"Site plan",kind:"Parcel-level plan",include:"Show the property and building context, project address, street names, orientation, and existing and proposed meter locations. Include known utility locations and a proposed service route when known.",why:"This helps communicate where the project and electrical equipment sit on the property.",evidence:"Confirmed guidance",alt:"Synthetic parcel-level site plan showing buildings, orientation, streets, and meter locations."},
      {id:"annotated-aerial",title:"Annotated aerial",kind:"Illustrative alternative",include:"Use an aerial view to label the property, streets, orientation, meter locations, and service route when known.",why:"An annotated aerial may provide parcel context when the applicable branch allows it.",evidence:"Illustrative prototype tip",alt:"Synthetic aerial-style property diagram with labels for orientation and meter locations."},
      {id:"hand-drawn-plan",title:"Hand-drawn plan",kind:"Illustrative alternative",include:"Use a clear drawing to communicate the same property relationships when that format is allowed.",why:"The useful information is the spatial relationship, not visual polish.",evidence:"Illustrative prototype tip",alt:"Synthetic hand-drawn property plan showing buildings, street, orientation, and meter locations."}
    ],note:"Example features do not make every format universally acceptable. Confirm the applicable document format before applying."
  },
  "Scaled exterior elevation plan":{
    id:"adu-elevation",title:"Example: exterior elevation",evidence:"Confirmed guidance",sourceId:"INT-A01",synthetic:true,rightsStatus:"unknown",
    boundary:"This synthetic example is document coaching only. It does not review clearances or approve an equipment location.",
    examples:[{id:"exterior-elevation",title:"Exterior elevation",kind:"Exterior and vertical context",include:"Show the exterior wall, existing and proposed meter placement, and nearby openings or vents. Show above-ground or below-ground utility relationships when applicable.",why:"This helps communicate vertical placement and the relationship between equipment and the building exterior.",evidence:"Confirmed guidance",alt:"Synthetic exterior elevation drawing with meter locations and nearby building features."}],
    note:"Do not use this example as a clearance determination or location approval."
  },
  "Building floor plan":{
    id:"adu-floor-plan",title:"Example: building floor plan",evidence:"Confirmed guidance",sourceId:"INT-A01",synthetic:true,rightsStatus:"unknown",
    boundary:"This synthetic example appears only with the conditional floor-plan guidance. Nothing has been uploaded, reviewed, submitted, approved, or stored.",
    examples:[{id:"floor-plan",title:"Building floor plan",kind:"Conditional interior context",include:"Show the room and building layout and the proposed interior metering context when applicable.",why:"A floor plan may help when an internal metering room is proposed. It is not a baseline requirement for every ADU.",evidence:"Confirmed guidance",alt:"Synthetic building floor plan showing room layout and a proposed internal metering area."}],
    note:"Conditional example: the current source scopes this document to an internal metering-room condition."
  }
};

var DOC_WHO_LABEL={self:"You can usually obtain this",contractor:"Usually your electrician or contractor",agency:"Your city or county (AHJ)"};
function docReqFor(pt){return DOC_REQUIREMENTS[pt]||null;}

/* ============================ Pre-intake guidance simulation — Panel Upgrade (APPROVED) ============================
   PRE-INTAKE CUSTOMER GUIDANCE, not an internal review tool. Client-side only, no uploads, no PII,
   no determination of approval or technical compliance. Data-only (§7). */
var PREINTAKE_DISCLAIMER="This is a practice example with made-up details \u2014 not your project and not an application. It gives guidance on what to prepare; it does not approve anything, check technical compliance, or estimate cost.";
var PREINTAKE_PANEL={
  scenario:"panel",
  title:"Practice: a panel-upgrade application",
  intro:"Here is a synthetic example application, like one a customer might submit. A few things are missing or unclear \u2014 the same gaps that most often slow real applications. Find and fix them, and you'll know what to have ready before you apply.",
  packet:{
    "Service address":{value:"123 Example St (sample)",status:"ok"},
    "Upgrade purpose":{value:"\u201cUpgrade my panel\u201d",status:"gap",issue:"unclear_purpose"},
    "Existing panel size":{value:"(blank)",status:"gap",issue:"missing_existing_panel"},
    "Proposed panel size":{value:"200A",status:"ok"},
    "Added load details":{value:"(blank)",status:"gap",issue:"unknown_added_load"},
    "Solar / battery":{value:"(not mentioned)",status:"gap",issue:"omitted_solar_battery"},
    "Like-for-like vs. increase":{value:"(not specified)",status:"gap",issue:"lfl_vs_increase"},
    "Overhead or underground":{value:"(not specified)",status:"warn",issue:"oh_ug"},
    "Main-switch size":{value:"(blank)",status:"warn",issue:"missing_main_switch"},
    "Site plan / meter location":{value:"(not attached)",status:"warn",issue:"missing_site_plan"}
  },
  gaps:[
    {id:"unclear_purpose",field:"Upgrade purpose",label:"Purpose of the work is unclear",why:"Intake must know the actual scope \u2014 fuses to breaker, splitting load, increasing load, a bigger panel, added solar, or overhead-to-underground. \u201cUpgrade my panel\u201d doesn't say which.",fix:"State plainly what you're changing and why (e.g., \u201cadding a heat pump and EV charger, need more capacity\u201d)."},
    {id:"missing_existing_panel",field:"Existing panel size",label:"Existing panel size is missing",why:"Without the current amperage, no one can tell whether this is an increase or a like-for-like replacement.",fix:"Read the main-breaker rating and record it (e.g., 100A). A photo of the panel label helps."},
    {id:"unknown_added_load",field:"Added load details",label:"Added load isn't described",why:"The new equipment and how much runs at once determines whether the service can support it. Missing load is a top cause of rework.",fix:"List what you're adding (EV charger, heat pump, A/C, range) so an electrician can do a load calculation."},
    {id:"omitted_solar_battery",field:"Solar / battery",label:"Solar or battery not mentioned",why:"Added solar or storage changes the review (voltage rise) and can require a building permit. It's easy to leave off.",fix:"Note any solar kW or battery (BESS) size and operating mode, even if planned for later."},
    {id:"lfl_vs_increase",field:"Like-for-like vs. increase",label:"Like-for-like vs. increased capacity not distinguished",why:"A like-for-like replacement (same capacity) follows a simpler path than an actual capacity increase. Going under 100A to a new 100A is not an upgrade.",fix:"Say whether capacity is increasing or staying the same. If unsure, mark it to confirm with your electrician."},
    {id:"oh_ug",field:"Overhead or underground",label:"Overhead vs. underground not specified",why:"An underground upgrade needing a larger cable can require trenching and a larger conduit \u2014 added time and cost.",fix:"Note whether your service is overhead or underground; if underground and going bigger, expect a conduit/trench question."},
    {id:"missing_main_switch",field:"Main-switch size",label:"Main-switch size missing",why:"Main-switch (main breaker) size is a core residential intake input used to size the service.",fix:"Record the main-switch amperage from the panel label."},
    {id:"missing_site_plan",field:"Site plan / meter location",label:"No site plan / meter location",why:"A site plan with the meter location marked (north arrow, street names) is a standard intake document.",fix:"Prepare a simple site plan or aerial with the meter location clearly marked."}
  ],
  complete_message:"Nice \u2014 you found the common gaps. With the purpose, existing and proposed panel sizes, added load, solar/battery, overhead/underground, main-switch size, and a meter-marked site plan, this application would be far more complete before intake.",
  next_action:"Photograph your main breaker and panel label, list the equipment you're adding, and confirm existing vs. proposed capacity with a licensed electrician."
};
function preintakeFor(pt){return pt==="panel"?PREINTAKE_PANEL:null;} /* ADU pattern extends later */

/* ============================ Light-illustrative scenarios S3–S11 (APPROVED, deliberately small) ============================
   ADU + Panel stay DEEP. These get recognition + a short honest stub only + the Illustrative note.
   S6/S7 intentionally omitted — ADU deep owns it. Data-only (§7). */
var ILLUSTRATIVE_SCENARIOS={
  increase_load:{id:"increase_load",title:"Increase Load",aliases:["more power","increase load","add load","load addition","add appliances","add hvac","add heat pump","add a pump","power new equipment"],
    summary:"This is about whether your existing service can carry the new demand \u2014 start by totaling what you're adding.",
    usuallyInvolves:["A list of the new equipment and its ratings","Your existing service size","An electrician's load calculation"],
    docHint:"Usually a load sheet plus photos of your existing service; an elevation or site plan if the layout changes.",
    mayPointTo:"panel",boundaryNote:"If the neighborhood transformer is already full, or the project reaches 400A or more, it needs more engineering and takes longer."},
  ev_charging:{id:"ev_charging",title:"EV Charging",aliases:["ev charger","ev charging","evse","level 2 charger","dc fast charger","fleet charging","charge my car","car charger"],
    summary:"Start with the charging you need, then check whether your existing service supports it \u2014 a dedicated meter is a different path.",
    usuallyInvolves:["Charger make/model and amperage","How many chargers","Whether you want a separate meter"],
    docHint:"Usually a load sheet and a site plan with the meter location marked; a permit if required close to submission.",
    mayPointTo:"panel",boundaryNote:"A separately metered EV station is a different, dedicated path."},
  relocate:{id:"relocate",title:"Relocate Panel / Meter",aliases:["move my meter","relocate panel","relocate meter","move the panel","remodel meter move","moving service equipment"],
    summary:"Moving a meter usually needs marked site photos of the old and new spots and the path to PG&E's line \u2014 and often pairs with a capacity change.",
    usuallyInvolves:["Current and proposed location","Whether capacity also increases","Clearance and distance-to-PG&E checks"],
    docHint:"Usually marked site photos; a single-line diagram or cut sheet if 320\u2013400A or higher.",
    mayPointTo:"panel",boundaryNote:"A new location must meet clearances and may need a longer service wire."},
  add_meter:{id:"add_meter",title:"Add Meter",aliases:["add a meter","add meter","another meter","extra meter","additional meter"],
    summary:"The simplest case \u2014 as long as there's an open meter socket, an existing service wire, and your load isn't changing.",
    usuallyInvolves:["Confirming an empty meter socket","Confirming an existing service wire","No change to your load"],
    docHint:"Usually a load sheet and photos of your existing service.",
    mayPointTo:"adu",boundaryNote:"If there's no socket or wire, or your load grows, it becomes a different (larger) path."},
  voltage_phase:{id:"voltage_phase",title:"Voltage / Phase Change",aliases:["three phase","three-phase","3 phase","single to three phase","voltage change","480v","phase change"],
    summary:"This matches your service to your equipment's voltage and phase \u2014 the simple residential case differs from three-phase, which takes more engineering.",
    usuallyInvolves:["Your equipment's voltage/phase specs","Your existing service and panel size","The jaw configuration you'll install"],
    docHint:"Usually equipment specs, panel size, and a site plan.",
    mayPointTo:"panel",boundaryNote:"Any three-phase, non-residential, or 400A+ case takes more engineering and time."},
  new_single_family:{id:"new_single_family",title:"New Single-Family Service",aliases:["new home","new construction","new service","brand new build","new house","new build"],
    summary:"A brand-new service connection \u2014 this is a new-construction path with its own document set and timeline.",
    usuallyInvolves:["Parcel/site plan and address","Main-switch size and voltage","Square footage, A/C, EV, solar, and battery details"],
    docHint:"Usually a site plan, load information, and elevation; larger jobs add a single-line diagram.",
    mayPointTo:null,boundaryNote:"New construction is distinct from an ADU on an existing premise, and often follows the longer new-project path."}
};
function illustrativeScenarioById(id){return ILLUSTRATIVE_SCENARIOS[id]||null;}
function routeIllustrativeScenario(text){var t=String(text||"").toLowerCase();
  var ids=Object.keys(ILLUSTRATIVE_SCENARIOS);
  for(var i=0;i<ids.length;i++){var s=ILLUSTRATIVE_SCENARIOS[ids[i]];
    for(var j=0;j<s.aliases.length;j++){if(t.indexOf(s.aliases[j])>=0)return s.id;}}
  return "";}

/* ============================ Universal readiness checklist (scenario-adaptive) ============================
   Pre-application readiness self-check. NOT a score, NOT a submission. Data-only (§7).
   ⚑ RESOLVED D-007-docwindow: the docs_window item now names the 19-day window but SCOPES it to the
   Express path and frames it protectively (avoid auto-cancellation). It is journey-scoped, not universal. */
var READINESS_CHECKLIST=[
  {id:"service_size",label:"I know my current electric service size (amperage)",appliesTo:["adu","panel","ev","solar","remodel","unsure"]},
  {id:"target_load",label:"I know the target load / capacity I need (if increasing)",appliesTo:["panel","ev","remodel","increase_load"]},
  {id:"photos",label:"I have photos of my existing panel and meter (meter up-close, panel 10' back, main breaker, rating sticker)",appliesTo:["adu","panel","ev","remodel","relocate","add_meter"]},
  {id:"site_plan",label:"I have (or can get) a site plan showing equipment location",appliesTo:["adu","panel","ev","solar","new_single_family"]},
  {id:"load_sheet",label:"I have a load sheet / load calc (if adding load or upgrading)",appliesTo:["adu","panel","ev","increase_load"]},
  {id:"permit_electrician",label:"I know whether I need a permit and a licensed electrician",appliesTo:["adu","panel","ev","solar","remodel"]},
  {id:"meter_service",label:"I know whether I need a new or second meter/service",appliesTo:["adu","add_meter"]},
  {id:"path",label:"I understand my likely path (Express vs. New Project)",appliesTo:["adu","panel","ev","solar","remodel","new_single_family"]},
  {id:"cost_timeline",label:"I have realistic cost and timeline expectations",appliesTo:["adu","panel","ev","solar","remodel","new_single_family"]},
  {id:"docs_window",label:"If I apply on the Express path, I can provide required documents within 19 days (to avoid an automatic cancellation)",appliesTo:["adu","panel","ev","solar","remodel","new_single_family"],expressScoped:true}
];
function readinessChecklistFor(pt){return READINESS_CHECKLIST.filter(function(x){return !x.appliesTo||x.appliesTo.indexOf(pt)>=0;});}

/* ============================ Educational cards ============================
   Plain-language explainers. Definitions accessible; no scoring, no submission. Data-only (§7). */
var EDU_CARDS=[
  {id:"panel_vs_service",title:"Panel upgrade vs. service upgrade",body:"Upgrading your panel adds capacity inside your home. A service upgrade changes the supply coming to your property. Whether you need one or both depends on how much power you're adding.",appliesTo:["panel","adu","ev","remodel","increase_load"]},
  {id:"site_plan",title:"What is a site plan?",body:"A drawing of your property showing structures, property lines, and where electrical equipment is (or will be). Missing details are a top cause of delays \u2014 confirm what must be included (meter location, north arrow, street names).",appliesTo:["adu","panel","ev","solar","new_single_family","relocate"]},
  {id:"load_sheet",title:"What is a load sheet?",body:"A list of your electrical loads used to size your service. Usually prepared by a licensed electrician.",appliesTo:["panel","adu","ev","increase_load"]},
  {id:"express_vs_new",title:"Express path vs. New Project path",body:"If your existing infrastructure can support your project, you're on the faster Express path. If new infrastructure is needed, it's the fuller New Project path with more design work.",appliesTo:["adu","panel","ev","solar","remodel","new_single_family"]},
  {id:"meter_vs_service",title:"One meter or a second service?",body:"Adding a meter is simpler than adding a whole separate service. ADUs and detached units often need their own service.",appliesTo:["adu","add_meter"]}
];
function eduCardsFor(pt){return EDU_CARDS.filter(function(x){return !x.appliesTo||x.appliesTo.indexOf(pt)>=0;});}
