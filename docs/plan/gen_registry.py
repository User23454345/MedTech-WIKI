import json
from collections import Counter
SP="/tmp/claude-0/-home-user-MedTech-WIKI/50f1be6d-b8a3-5568-9097-c6fa1909fa52/scratchpad/"
R=[]
def add(id,type,title,cat,**kw): R.append(dict(id=id,type=type,title=title,category=cat,**kw))
D=[
("patientenmonitor","Patientenmonitor","monitoring",1),
("beatmungsgeraet","Intensivbeatmungsgerät","beatmung-anaesthesie",1),
("defibrillator","Defibrillator (inkl. AED)","kardiologie",1),
("infusionspumpe","Volumetrische Infusionspumpe","infusion",1),
("spritzenpumpe","Spritzenpumpe","infusion",1),
("ekg-geraet","Elektrokardiograph (12-Kanal-EKG)","kardiologie",1),
("pulsoxymeter","Pulsoxymeter","monitoring",1),
("anaesthesiegeraet","Anästhesiearbeitsplatz (Narkosegerät)","beatmung-anaesthesie",1),
("ultraschallgeraet","Ultraschallgerät (Sonographie)","bildgebung",1),
("computertomograph","Computertomograph (CT)","bildgebung",1),
("mrt","Magnetresonanztomograph (MRT)","bildgebung",1),
("roentgengeraet","Röntgenanlage (Projektionsradiographie)","bildgebung",1),
("dialysegeraet","Hämodialysegerät","extrakorporal",1),
("hf-chirurgiegeraet","HF-Chirurgiegerät","chirurgie",1),
("inkubator","Säuglingsinkubator","neonatologie",1),
("nibp-messgeraet","Automatisches nichtinvasives Blutdruckmessgerät","monitoring",0),
("invasive-druckmessung","Invasive Blutdruckmessung (Druckmesssystem)","monitoring",0),
("kapnometer","Kapnometer / Kapnograph","monitoring",0),
("transportbeatmungsgeraet","Notfall- und Transportbeatmungsgerät","notfall",0),
("herz-lungen-maschine","Herz-Lungen-Maschine","extrakorporal",0),
("ecmo","ECMO-System","extrakorporal",0),
("crrt-geraet","Gerät zur kontinuierlichen Nierenersatztherapie (CRRT)","extrakorporal",0),
("iabp","Intraaortale Ballonpumpe (IABP)","kardiologie",0),
("vad","Herzunterstützungssystem (VAD)","kardiologie",0),
("herzschrittmacher","Implantierbarer Herzschrittmacher","kardiologie",0),
("icd","Implantierbarer Kardioverter-Defibrillator (ICD)","kardiologie",0),
("externer-schrittmacher","Externer temporärer Herzschrittmacher","kardiologie",0),
("langzeit-ekg","Langzeit-EKG-Rekorder","kardiologie",0),
("ergometer","Belastungs-EKG mit Ergometer","kardiologie",0),
("langzeit-blutdruck","Langzeit-Blutdruckmessgerät","kardiologie",0),
("thoraxkompressionsgeraet","Mechanisches Thoraxkompressionsgerät","notfall",0),
("absauggeraet","Medizinisches Absauggerät","pflege",0),
("cpap-geraet","CPAP-/Schlaftherapiegerät","beatmung-anaesthesie",0),
("heimbeatmungsgeraet","Heimbeatmungsgerät","beatmung-anaesthesie",0),
("sauerstoffkonzentrator","Sauerstoffkonzentrator","beatmung-anaesthesie",0),
("inhalationsgeraet","Inhalationsgerät (Vernebler)","beatmung-anaesthesie",0),
("high-flow-geraet","High-Flow-Sauerstofftherapiegerät","beatmung-anaesthesie",0),
("enterale-ernaehrungspumpe","Enterale Ernährungspumpe","infusion",0),
("pca-pumpe","PCA-Pumpe (patientenkontrollierte Analgesie)","infusion",0),
("insulinpumpe","Insulinpumpe","infusion",0),
("infusionswaermer","Blut- und Infusionswärmer","infusion",0),
("mammographiegeraet","Mammographiesystem","bildgebung",0),
("c-bogen","C-Bogen (mobile Durchleuchtung)","bildgebung",0),
("angiographieanlage","Angiographieanlage","bildgebung",0),
("pet-ct","PET/CT","strahlentherapie",0),
("gammakamera","Gammakamera / SPECT","strahlentherapie",0),
("linearbeschleuniger","Medizinischer Linearbeschleuniger","strahlentherapie",0),
("afterloader","Afterloading-Gerät (Brachytherapie)","strahlentherapie",0),
("dvt","Digitale Volumentomographie (DVT)","augen-hno-dental",0),
("knochendichtemessung","Knochendichtemessgerät (DXA)","bildgebung",0),
("eeg-geraet","Elektroenzephalograph (EEG)","funktionsdiagnostik",0),
("emg-geraet","Elektromyograph / Neurographie (EMG/NLG)","funktionsdiagnostik",0),
("spirometer","Spirometer","funktionsdiagnostik",0),
("bodyplethysmograph","Bodyplethysmograph","funktionsdiagnostik",0),
("polysomnograph","Polysomnograph","funktionsdiagnostik",0),
("ctg","Kardiotokograph (CTG)","funktionsdiagnostik",0),
("audiometer","Audiometer","augen-hno-dental",0),
("thermometer","Medizinisches elektrisches Thermometer","monitoring",0),
("blutzuckermessgeraet","Blutzuckermessgerät","labor",0),
("blutgasanalysator","Blutgasanalysator","labor",0),
("haematologie-analysator","Hämatologie-Analysator","labor",0),
("klinisch-chemischer-analysator","Klinisch-chemischer Analysator","labor",0),
("gerinnungsanalysator","Gerinnungsanalysator","labor",0),
("laborzentrifuge","Laborzentrifuge","labor",0),
("blutkuehlschrank","Blutkonservenkühlschrank","labor",0),
("zellseparator","Zellseparator (Apheresegerät)","extrakorporal",0),
("endoskop","Flexibles Videoendoskop","endoskopie",0),
("kapselendoskop","Kapselendoskop","endoskopie",0),
("insufflator","CO₂-Insufflator (Laparoskopie)","endoskopie",0),
("videolaryngoskop","Videolaryngoskop","beatmung-anaesthesie",0),
("op-tisch","Operationstisch","chirurgie",0),
("op-leuchte","Operationsleuchte","chirurgie",0),
("op-mikroskop","Operationsmikroskop","chirurgie",0),
("chirurgischer-laser","Chirurgisches Lasersystem","chirurgie",0),
("ultraschalldissektor","Ultraschall-Dissektionsgerät","chirurgie",0),
("chirurgisches-motorsystem","Chirurgisches Motorsystem","chirurgie",0),
("op-roboter","Robotisches Chirurgie-Assistenzsystem","chirurgie",0),
("patientenwaermesystem","Patientenwärmesystem","chirurgie",0),
("lithotripter","Extrakorporaler Stoßwellen-Lithotripter (ESWL)","chirurgie",0),
("waermebett","Säuglingswärmebett / Reanimationseinheit","neonatologie",0),
("phototherapiegeraet","Phototherapiegerät (Neugeborenenikterus)","neonatologie",0),
("hypothermiegeraet","Temperaturmanagementsystem (Hypothermie)","therapie",0),
("druckkammer","Druckkammer (Hyperbare Oxygenation)","therapie",0),
("reizstromgeraet","Reizstromgerät (TENS/EMS)","therapie",0),
("ultraschalltherapiegeraet","Ultraschalltherapiegerät","therapie",0),
("ipk-geraet","Gerät zur intermittierenden pneumatischen Kompression","therapie",0),
("npwt-geraet","Unterdruck-Wundtherapiegerät (NPWT)","therapie",0),
("cochlea-implantat","Cochlea-Implantat-System","augen-hno-dental",0),
("hoergeraet","Hörgerät","augen-hno-dental",0),
("spaltlampe","Spaltlampe","augen-hno-dental",0),
("tonometer","Augentonometer","augen-hno-dental",0),
("oct","Optische Kohärenztomographie (OCT)","augen-hno-dental",0),
("phakoemulsifikation","Phakoemulsifikationssystem","augen-hno-dental",0),
("dentaleinheit","Zahnärztliche Behandlungseinheit","augen-hno-dental",0),
("dampfsterilisator","Dampfsterilisator","aufbereitung",0),
("niedertemperatursterilisator","Niedertemperatur-Plasmasterilisator","aufbereitung",0),
("rdg","Reinigungs- und Desinfektionsgerät (RDG)","aufbereitung",0),
("pflegebett","Elektrisches Klinik- und Pflegebett","pflege",0),
("patientenlifter","Patientenlifter","pflege",0),
("antidekubitussystem","Antidekubitus-Wechseldrucksystem","pflege",0),
]
assert len(D)==100, len(D)
for i,(id,t,g,det) in enumerate(D,1):
    add(id,"device",t,"geraete",deviceGroup=g,rank=i,status="ausfuehrlich" if det else "stub")
def T(cat,lst,typ="term"):
    for a,b in lst: add(a,typ,b,cat)
T("einfuehrung",[("medizintechnik","Medizintechnik"),("geschichte-medizintechnik","Geschichte der Medizintechnik"),("berufe-medizintechnik","Berufe in der Medizintechnik"),("lebenszyklus-medizinprodukt","Lebenszyklus eines Medizinprodukts"),("patientensicherheit","Patientensicherheit und Medizintechnik"),("gebrauchstauglichkeit","Gebrauchstauglichkeit (Usability)"),("medizinisches-elektrisches-geraet","Medizinisches elektrisches Gerät (ME-Gerät)")])
T("fachbereiche",[("intensivmedizin","Intensivmedizin"),("anaesthesiologie","Anästhesiologie"),("kardiologie","Kardiologie"),("radiologie","Radiologie"),("nephrologie","Nephrologie"),("chirurgie","Chirurgie"),("notfallmedizin","Notfall- und Rettungsmedizin"),("neonatologie","Neonatologie"),("neurologie","Neurologie"),("pneumologie","Pneumologie"),("nuklearmedizin","Nuklearmedizin"),("strahlentherapie","Strahlentherapie (Radioonkologie)"),("labormedizin","Laboratoriumsmedizin"),("gastroenterologie","Gastroenterologie"),("augenheilkunde","Augenheilkunde"),("hno-heilkunde","Hals-Nasen-Ohren-Heilkunde"),("zahnmedizin","Zahnmedizin"),("geburtshilfe","Gynäkologie und Geburtshilfe"),("orthopaedie-unfallchirurgie","Orthopädie und Unfallchirurgie"),("physikalische-medizin","Physikalische und Rehabilitative Medizin"),("diabetologie","Diabetologie"),("herzchirurgie","Herzchirurgie")],"domain")
T("hersteller",[("draeger","Drägerwerk"),("hamilton-medical","Hamilton Medical"),("philips","Philips"),("ge-healthcare","GE HealthCare"),("siemens-healthineers","Siemens Healthineers"),("medtronic","Medtronic"),("zoll","ZOLL Medical"),("stryker","Stryker"),("b-braun","B. Braun"),("fresenius-medical-care","Fresenius Medical Care"),("fresenius-kabi","Fresenius Kabi"),("baxter","Baxter"),("nihon-kohden","Nihon Kohden"),("mindray","Mindray"),("schiller","Schiller"),("erbe","Erbe Elektromedizin"),("olympus","Olympus"),("karl-storz","KARL STORZ"),("getinge","Getinge"),("canon-medical","Canon Medical Systems"),("loewenstein-medical","Löwenstein Medical"),("masimo","Masimo"),("icu-medical","ICU Medical"),("bd","BD (Becton, Dickinson and Company)"),("resmed","ResMed"),("zeiss","Carl Zeiss Meditec"),("elekta","Elekta"),("intuitive","Intuitive Surgical"),("abbott","Abbott"),("boston-scientific","Boston Scientific"),("biotronik","Biotronik"),("roche-diagnostics","Roche Diagnostics"),("sysmex","Sysmex"),("weinmann","Weinmann Emergency"),("corpuls","corpuls"),("fujifilm","Fujifilm Healthcare"),("dentsply-sirona","Dentsply Sirona"),("cochlear","Cochlear"),("belimed","Belimed"),("arjo","Arjo"),("hillrom","Hillrom")],"manufacturer")
T("komponenten",[("turbine","Turbine (Radialgebläse)"),("elektromotor","Elektromotor"),("bldc-motor","Bürstenloser Gleichstrommotor (BLDC)"),("schrittmotor","Schrittmotor"),("magnetventil","Magnetventil"),("proportionalventil","Proportionalventil"),("exspirationsventil","Exspirationsventil"),("peristaltikpumpe","Peristaltikpumpe"),("spindelantrieb","Spindelantrieb"),("lithium-ionen-akku","Lithium-Ionen-Akkumulator"),("medizinisches-netzteil","Medizinisches Netzteil"),("kondensator","Kondensator"),("transformator","Transformator"),("roentgenroehre","Röntgenröhre"),("roentgendetektor","Röntgendetektor (Flachdetektor)"),("kollimator","Kollimator und Blende"),("gantry","Gantry"),("supraleitender-magnet","Supraleitender Magnet"),("gradientenspule","Gradientenspule"),("hf-spule","HF-Spule (MRT)"),("ultraschallwandler","Ultraschallwandler (Schallkopf)"),("dialysator","Dialysator"),("narkosemittelverdampfer","Narkosemittelverdampfer"),("co2-absorber","CO₂-Absorber (Atemkalk)"),("atemgasbefeuchter","Atemgasbefeuchter und HME-Filter"),("neutralelektrode","Neutralelektrode"),("defibrillationselektroden","Defibrillationselektroden"),("heizelement","Heizelement"),("display-bedienoberflaeche","Display und Bedienoberfläche")])
T("sensorik",[("druckmessung","Druckmessung"),("drucksensor","Piezoresistiver Drucksensor"),("flowsensor","Flowsensor"),("temperatursensor","Temperatursensor"),("sauerstoffsensor","Sauerstoffsensor"),("co2-sensor","CO₂-Sensor (NDIR)"),("photoplethysmographie","Photoplethysmographie"),("ekg-elektrode","EKG-Elektrode (Ag/AgCl)"),("luftblasendetektor","Luftblasendetektor"),("leitfaehigkeitssensor","Leitfähigkeitsmessung"),("blutleckdetektor","Blutleckdetektor"),("kraftsensor","Kraftsensor (Dehnungsmessstreifen)"),("hall-sensor","Hall-Sensor"),("oszillometrie","Oszillometrische Blutdruckmessung"),("messkette","Messkette"),("messunsicherheit","Messabweichung und Messunsicherheit"),("biosignale","Biosignale")])
T("elektrotechnik",[("spannung-strom-widerstand","Spannung, Strom und Widerstand"),("operationsverstaerker","Operationsverstärker"),("instrumentenverstaerker","Instrumentenverstärker"),("analog-digital-wandler","Analog-Digital-Wandler"),("filter","Analoge und digitale Filter"),("pwm","Pulsweitenmodulation (PWM)"),("drehzahlregelung","Drehzahlregelung"),("regelkreis","Regelkreis und PID-Regler"),("mikrocontroller","Mikrocontroller und Embedded-Systeme"),("galvanische-trennung","Galvanische Trennung"),("schutzklassen","Schutzklassen"),("anwendungsteile","Anwendungsteile (Typ B, BF, CF)"),("ableitstrom","Ableitstrom"),("emv","Elektromagnetische Verträglichkeit (EMV)"),("medizinisch-genutzte-bereiche","Elektrische Anlagen in medizinisch genutzten Bereichen"),("hochspannungserzeugung","Hochspannungserzeugung"),("dicom","DICOM"),("hl7-fhir","HL7 und FHIR"),("alarmsystem","Alarmsysteme medizinischer Geräte")])
T("physik",[("druck","Druck"),("gasgesetze","Gasgesetze"),("stroemungslehre","Strömungslehre"),("elektrische-stromwirkung","Wirkung des elektrischen Stroms auf den Körper"),("joulesche-waerme","Joulesche Wärme"),("piezoelektrischer-effekt","Piezoelektrischer Effekt"),("schallwellen","Schallwellen und Ultraschallphysik"),("doppler-effekt","Doppler-Effekt"),("lambert-beer","Lambert-Beer-Gesetz"),("roentgenstrahlung","Röntgenstrahlung"),("ionisierende-strahlung","Wechselwirkung ionisierender Strahlung mit Materie"),("radioaktivitaet","Radioaktivität"),("kernspinresonanz","Kernspinresonanz"),("elektromagnetische-induktion","Elektromagnetische Induktion"),("diffusion-osmose","Diffusion, Osmose und Konvektion"),("waermeuebertragung","Wärmeübertragung"),("laser","Laser"),("optik","Optik und Lichtausbreitung")])
T("anatomie",[("herz","Herz"),("erregungsleitungssystem","Erregungsbildungs- und -leitungssystem"),("aktionspotential","Aktionspotential"),("blutkreislauf","Blutkreislauf"),("blutdruck","Blutdruck (Physiologie)"),("lunge","Lunge und Atemwege"),("atemmechanik","Atemmechanik"),("gasaustausch","Gasaustausch"),("haemoglobin","Hämoglobin und Sauerstoffbindung"),("niere","Niere"),("nervensystem","Nervensystem"),("haut","Haut"),("thermoregulation","Thermoregulation"),("blut","Blut"),("saeure-basen-haushalt","Säure-Basen-Haushalt"),("auge","Auge"),("ohr","Ohr und Hören")])
T("recht",[("medizinprodukt","Medizinprodukt (Begriff)"),("zweckbestimmung","Zweckbestimmung"),("risikoklassen","Risikoklassen von Medizinprodukten"),("ce-kennzeichnung","CE-Kennzeichnung"),("benannte-stelle","Benannte Stelle"),("konformitaetsbewertung","Konformitätsbewertung"),("klinische-bewertung","Klinische Bewertung"),("udi","UDI – Unique Device Identification"),("vigilanz","Vigilanz und Vorkommnismeldung"),("betreiberpflichten","Betreiberpflichten"),("einweisung","Einweisung in Medizinprodukte"),("beauftragter-medizinproduktesicherheit","Beauftragter für Medizinproduktesicherheit"),("medizinproduktebuch","Medizinproduktebuch"),("bestandsverzeichnis","Bestandsverzeichnis"),("software-medizinprodukt","Software als Medizinprodukt"),("strahlenschutz","Strahlenschutz in der Medizin")])
T("stk-mtk",[("stk","Sicherheitstechnische Kontrolle (STK)"),("mtk","Messtechnische Kontrolle (MTK)"),("elektrische-sicherheitspruefung","Elektrische Sicherheitsprüfung nach IEC 62353"),("schutzleiterwiderstand","Schutzleiterwiderstand"),("isolationswiderstand","Isolationswiderstand"),("ableitstrommessung","Ableitstrommessung"),("funktionspruefung","Funktionsprüfung"),("pruefgeraete","Prüfgeräte und Simulatoren"),("dguv-vorschrift-3","Prüfung nach DGUV Vorschrift 3"),("konstanzpruefung","Abnahme- und Konstanzprüfung (Röntgen)")])
T("instandhaltung",[("instandhaltung-grundlagen","Instandhaltung"),("wartung","Wartung"),("inspektion","Inspektion"),("instandsetzung","Instandsetzung"),("kalibrierung","Kalibrierung und Justierung"),("aufbereitung","Aufbereitung von Medizinprodukten"),("sterilisation","Sterilisation"),("desinfektion","Desinfektion"),("medizintechnik-management","Medizintechnik-Management"),("fehlersuche","Systematische Fehlersuche")])
T("fehler",[("okklusionsalarm","Okklusionsalarm"),("luft-im-system","Luft-im-System-Alarm"),("leckage","Leckagealarm (Beatmung)"),("atemwegsdruck-hoch","Alarm: Atemwegsdruck hoch"),("diskonnektion","Diskonnektion"),("elektrodenproblem","Elektrode ab / schlechter Elektrodenkontakt"),("bewegungsartefakt","Bewegungsartefakte"),("netzstoerung","Netzbrumm (50-Hz-Störung)"),("akkufehler","Akkufehler und Kapazitätsverlust"),("sensordrift","Sensordrift"),("emv-stoerung","EMV-Störung"),("anwendungsfehler","Anwendungsfehler"),("alarmmuedigkeit","Alarmmüdigkeit"),("neutralelektroden-verbrennung","Verbrennung unter der Neutralelektrode"),("blutleck-alarm","Blutleckalarm"),("leitfaehigkeitsalarm","Leitfähigkeitsalarm"),("bildartefakte","Bildartefakte"),("fehlercodes","Fehlercodes und Fehlerspeicher")],"fault")
T("recht",[("mdr","Medizinprodukteverordnung (MDR)"),("ivdr","In-vitro-Diagnostika-Verordnung (IVDR)"),("mpdg","Medizinprodukterecht-Durchführungsgesetz (MPDG)"),("mpbetreibv","Medizinprodukte-Betreiberverordnung (MPBetreibV)"),("strlschg","Strahlenschutzgesetz (StrlSchG)")],"standard")
T("normen",[("iec-60601-1","IEC 60601-1"),("iec-60601-1-2","IEC 60601-1-2"),("iec-60601-1-6","IEC 60601-1-6"),("iec-60601-1-8","IEC 60601-1-8"),("iec-60601-1-11","IEC 60601-1-11"),("iec-62353","IEC 62353"),("iso-14971","ISO 14971"),("iec-62304","IEC 62304"),("iso-13485","ISO 13485"),("iec-62366-1","IEC 62366-1"),("iso-10993-1","ISO 10993-1"),("din-31051","DIN 31051"),("din-vde-0100-710","DIN VDE 0100-710"),("iec-60479-1","IEC/TS 60479-1"),("iso-80601-2-12","ISO 80601-2-12"),("iso-80601-2-13","ISO 80601-2-13"),("iec-60601-2-4","IEC 60601-2-4"),("iec-60601-2-24","IEC 60601-2-24"),("iso-80601-2-61","ISO 80601-2-61"),("iec-60601-2-16","IEC 60601-2-16"),("iec-60601-2-2","IEC 60601-2-2"),("iec-60601-2-37","IEC 60601-2-37"),("iec-60601-2-33","IEC 60601-2-33"),("iec-60601-2-44","IEC 60601-2-44"),("iec-60601-2-19","IEC 60601-2-19"),("iec-60601-2-25","IEC 60601-2-25"),("iec-60601-2-27","IEC 60601-2-27"),("iec-80601-2-30","IEC 80601-2-30"),("iec-80601-2-49","IEC 80601-2-49"),("iso-80601-2-55","ISO 80601-2-55"),("iec-60601-2-54","IEC 60601-2-54"),("iec-61010-1","IEC 61010-1"),("iso-17665","ISO 17665"),("iso-15883","ISO 15883")],"standard")
ids=[r["id"] for r in R]
assert len(ids)==len(set(ids)), [i for i in ids if ids.count(i)>1]
cats=["einfuehrung","fachbereiche","geraete","hersteller","komponenten","sensorik","elektrotechnik","physik","anatomie","recht","stk-mtk","instandhaltung","fehler","abkuerzungen","normen"]
assert not set(ids)&set(cats), set(ids)&set(cats)
json.dump(R,open(SP+"registry.json","w"),ensure_ascii=False,indent=1)
# planned-ids incl. categories for validator
json.dump(sorted(ids+cats),open(SP+"planned-ids.json","w"))
print(len(R), Counter(r["type"] for r in R))
