/* ============================================================
   Gefährdungsbeurteilung & Sicherheitskonzept – app.js
   Reines Vanilla JS (ES-Modul-frei, läuft per file://).
   Standardkataloge sind eingebettet, weil fetch() auf lokale
   Dateien unter file:// von Browsern blockiert wird.
   ============================================================ */
'use strict';

const STORAGE_KEY = 'gefb_state_v1';

/* ------------------------------------------------------------
   Feste Kategorienliste (für Bereich-Dropdown UND Filter)
   ------------------------------------------------------------ */
const KATEGORIEN = [
  'Aufbau/Abbau', 'Höhen/Lasten', 'Technik/Bühne', 'Strom/Energie',
  'Brandschutz', 'Flucht/Rettung', 'Personenströme', 'Zutritt/Sicherheit',
  'Messe/Ausstellung', 'Catering/Hygiene', 'Beschäftigte', 'Außen/Witterung',
  'Logistik/Verkehr', 'Gefahrstoffe', 'Notfall/Gefahrenabwehr', 'Inklusion', 'Sonstige'
];

/* ------------------------------------------------------------
   Ein einziger, vollständiger Gefährdungskatalog
   – Messe, Kongress, Tagung, Veranstaltungstechnik und Strom in
     einem Katalog zusammengeführt (keine Trennung mehr).
   e/s = Risiko ohne Maßnahme, re/rs = Restrisiko mit Maßnahme
   ------------------------------------------------------------ */
const KATALOG = [
  /* ---- Aufbau / Abbau ---- */
  { id:'k-01', bereich:'Aufbau/Abbau', gefahr:'Absturz von Höhe (Rigging, Bühnenkante, Leiter)', massnahme:'T: Geländer/Absturzsicherung, Auffangnetze · O: Höhenarbeit nur durch befähigte Personen, Bereich absperren · P: PSAgA (Anschlagpunkte, Auffanggurt)', e:3, s:4, re:1, rs:4 },
  { id:'k-02', bereich:'Aufbau/Abbau', gefahr:'Sturz von Leitern/Tritten', massnahme:'S: Hubarbeitsbühne statt Leiter wo möglich · O: geprüfte Leitern, Standsicherheit, Unterweisung', e:3, s:2, re:2, rs:2 },
  { id:'k-03', bereich:'Aufbau/Abbau', gefahr:'Stolpern über Kabel/Material/Höhenunterschiede', massnahme:'T: Kabelbrücken/-kanäle, Abhängung · O: Wege freihalten, Markierung, ausreichende Beleuchtung', e:4, s:2, re:2, rs:2 },
  { id:'k-04', bereich:'Aufbau/Abbau', gefahr:'Schnitt-/Quetschverletzungen (Werkzeug, Cases)', massnahme:'O: Unterweisung, geeignetes Werkzeug · P: Schnittschutz-/Arbeitshandschuhe, Sicherheitsschuhe', e:3, s:2, re:2, rs:2 },

  /* ---- Höhen / Lasten ---- */
  { id:'k-05', bereich:'Höhen/Lasten', gefahr:'Herabfallende Lasten / hängende Traversen', massnahme:'T: Sekundärsicherung (Safeties), geprüfte Lastaufnahmemittel · O: Bereich unter Last sperren · P: Helm', e:2, s:4, re:1, rs:4 },
  { id:'k-06', bereich:'Höhen/Lasten', gefahr:'Versagen Anschlagmittel / Überlast Aufhängung', massnahme:'T: zugelassene Anschlagmittel mit Lastreserve · O: Prüfung durch Sachkundigen, Lastdokumentation', e:2, s:4, re:1, rs:4 },
  { id:'k-07', bereich:'Höhen/Lasten', gefahr:'Einsturz Bühne/Podest/Traverse', massnahme:'T: statischer Nachweis, geprüfte Systeme · O: Aufbau nach Herstellervorgabe, Abnahme vor Nutzung', e:1, s:4, re:1, rs:4 },

  /* ---- Technik / Bühne ---- */
  { id:'k-08', bereich:'Technik/Bühne', gefahr:'Bewegliche Bühnentechnik (Drehbühne, Hubpodien)', massnahme:'T: Quetschkantenschutz, Not-Aus · O: Bedienung nur durch eingewiesenes Personal, Bereich sichern', e:2, s:3, re:1, rs:3 },
  { id:'k-09', bereich:'Technik/Bühne', gefahr:'Bühne/Medientechnik/Rigging über Publikum', massnahme:'T: Sekundärsicherung, statischer Nachweis · O: geprüfte Lasten, Sperrbereiche bei Montage', e:2, s:4, re:1, rs:4 },
  { id:'k-10', bereich:'Technik/Bühne', gefahr:'Ausfall Dolmetsch-/Medientechnik (internat. Kongress)', massnahme:'T: Redundanz, Ersatzgeräte · O: Technik-Standby, Notfallablauf', e:2, s:2, re:1, rs:2 },
  { id:'k-11', bereich:'Technik/Bühne', gefahr:'Sturz von Podest/Rednerbühne (auch Teilnehmer)', massnahme:'T: Geländer/Kantenmarkierung, rutschhemmend · O: Beleuchtung, Einweisung', e:2, s:3, re:1, rs:3 },

  /* ---- Strom / Energie ---- */
  { id:'k-12', bereich:'Strom/Energie', gefahr:'Elektrische Gefährdung (Provisorien, Kabeltrassen)', massnahme:'T: RCD/FI-Schutz, geprüfte Betriebsmittel · O: Elektrofachkraft, DGUV-V3-Prüfung', e:3, s:3, re:1, rs:3 },
  { id:'k-13', bereich:'Strom/Energie', gefahr:'Überlast / Kabelbrand Mehrfachverteiler', massnahme:'T: ausreichend dimensionierte Verteilung, Absicherung · O: Lastverteilung, keine Kaskadierung', e:2, s:3, re:1, rs:3 },
  { id:'k-14', bereich:'Strom/Energie', gefahr:'Stromausfall sicherheitsrelevanter Technik (Betrieb/Session)', massnahme:'T: Netzersatz/USV für sicherheitsrelevante Technik · O: Notfallplan, Durchsagekonzept, Programmunterbrechung', e:2, s:3, re:1, rs:3 },
  { id:'k-15', bereich:'Strom/Energie', gefahr:'Ausfall Sicherheitsstromversorgung / Notstrom / USV', massnahme:'T: redundante USV, Sicherheitsbeleuchtung mit Batterie · O: Wartung, Funktionsprüfung vor Veranstaltung', e:2, s:4, re:1, rs:4 },
  { id:'k-16', bereich:'Strom/Energie', gefahr:'Aggregat/Generator (Abgase, Betankung, Lärm)', massnahme:'T: Aufstellung im Freien mit Abstand, Abgasführung, Erdung · O: Betankung nur bei Stillstand, Brandschutz · P: Gehörschutz', e:2, s:3, re:1, rs:2 },

  /* ---- Brandschutz ---- */
  { id:'k-17', bereich:'Brandschutz', gefahr:'Entstehungsbrand / Brandlast (Deko & Aufbauten)', massnahme:'S: schwerentflammbare Materialien (B1) · T: Brandlast reduzieren · O: B1-Nachweis, Brandwache', e:2, s:4, re:1, rs:4 },
  { id:'k-18', bereich:'Brandschutz', gefahr:'Pyrotechnik / offene Flamme / Laser / Nebel', massnahme:'S: Verzicht/Alternative · O: Genehmigung, befähigte Person, Brandsicherheitswache, Abstände · T: Nebel mit BMA/ELA abstimmen', e:2, s:4, re:1, rs:3 },
  { id:'k-19', bereich:'Brandschutz', gefahr:'Verstellte/abgeschaltete Brandschutzeinrichtungen (BMA, Hydranten)', massnahme:'O: Freihaltung BMA/Hydranten/Feuerlöscher, Kontrolle, keine BMA-Abschaltung ohne Ersatzmaßnahme', e:2, s:4, re:1, rs:4 },
  { id:'k-20', bereich:'Brandschutz', gefahr:'Brandlast Messestände / Ausstellung im Foyer', massnahme:'S: B1-Materialien · O: B1-Nachweis Standbau, Standabnahme, Brandwache · T: Wege freihalten', e:2, s:4, re:1, rs:4 },
  { id:'k-21', bereich:'Brandschutz', gefahr:'Dekobeleuchtung / Kerzen / Heizstrahler (Abendevent)', massnahme:'S: LED statt offener Flamme · O: Abstände, Brandwache · T: standsichere Heizstrahler mit Abstand', e:2, s:3, re:1, rs:3 },

  /* ---- Flucht / Rettung ---- */
  { id:'k-22', bereich:'Flucht/Rettung', gefahr:'Verstellte/unzureichende Flucht- und Rettungswege', massnahme:'O: Fluchtwege/Notausgänge freihalten, regelmäßige Kontrolle, Bestuhlungsplan einhalten', e:3, s:4, re:1, rs:4 },
  { id:'k-23', bereich:'Flucht/Rettung', gefahr:'Ausfall Sicherheits-/Notbeleuchtung/Kennzeichnung', massnahme:'T: Sicherheitsbeleuchtung mit Notstrom, geprüft · O: Funktionsprüfung vor Veranstaltung', e:2, s:3, re:1, rs:3 },
  { id:'k-24', bereich:'Flucht/Rettung', gefahr:'Blockierte Feuerwehr-/Rettungszufahrten', massnahme:'O: Zufahrten/Aufstellflächen freihalten, Beschilderung, Abschleppregelung', e:2, s:4, re:1, rs:4 },
  { id:'k-25', bereich:'Flucht/Rettung', gefahr:'Entfluchtung bestuhlter Säle (Reihen-/Blockbestuhlung)', massnahme:'T: Bestuhlungsplan nach Gangbreiten/Reihenabständen · O: Genehmigung, Räumungshelfer, Wege frei', e:2, s:4, re:1, rs:4 },
  { id:'k-26', bereich:'Flucht/Rettung', gefahr:'Räumung über mehrere Ebenen / Aufzüge im Brandfall', massnahme:'O: Räumungskonzept (Aufzüge nicht nutzen), Treppenraumlenkung, Räumungshelfer · T: ELA-Durchsagen', e:2, s:4, re:1, rs:4 },

  /* ---- Personenströme ---- */
  { id:'k-27', bereich:'Personenströme', gefahr:'Gedränge / Engstellen im Personenstrom', massnahme:'T: breitere Wegeführung, Leitsystem · O: Personenstromlenkung, Ordnungsdienst, Kapazitätssteuerung', e:3, s:3, re:2, rs:3 },
  { id:'k-28', bereich:'Personenströme', gefahr:'Überschreitung zugelassener Personenzahl (gesamt)', massnahme:'O: Einlasszählung, genehmigte Höchstzahl, Einlassstopp · T: Zählsystem', e:2, s:4, re:1, rs:4 },
  { id:'k-29', bereich:'Personenströme', gefahr:'Überfüllung einzelner Säle/Räume (z. B. beliebte Keynote)', massnahme:'O: saalbezogene Höchstzahl, Einlasszählung/-stopp, Personal an Saaltüren · T: Alternativräume/Streaming', e:3, s:4, re:1, rs:4 },
  { id:'k-30', bereich:'Personenströme', gefahr:'Panik / unkontrollierte Massenbewegung', massnahme:'O: Personenstrommanagement, klare Durchsagen, geschultes Personal, Räumungskonzept · T: ELA', e:1, s:4, re:1, rs:4 },
  { id:'k-31', bereich:'Personenströme', gefahr:'Stau in Foyers bei Pausen / Sessionwechsel', massnahme:'O: entzerrte Pausen-/Sessionzeiten, Wegeführung · T: breite Verkehrsflächen, Leitsystem', e:3, s:2, re:2, rs:2 },
  { id:'k-32', bereich:'Personenströme', gefahr:'Rückstau bei Einlass / Registrierung', massnahme:'T: ausreichend Einlassspuren/Scanner · O: Zeitfenster-Einlass, Wartezonen, Personal', e:3, s:2, re:2, rs:1 },
  { id:'k-33', bereich:'Personenströme', gefahr:'Andrang an Garderobe / Catering-Ausgabe', massnahme:'T: dezentrale Ausgaben, ausreichende Kapazität · O: Personalsteuerung, Wegeführung', e:3, s:1, re:2, rs:1 },

  /* ---- Zutritt / Sicherheit ---- */
  { id:'k-34', bereich:'Zutritt/Sicherheit', gefahr:'Unbefugter Zutritt / Umgehung der Akkreditierung', massnahme:'T: Akkreditierungssystem/Badges, Vereinzelung · O: Zutrittskontrolle, Ordnungsdienst, Zonenkonzept', e:3, s:3, re:1, rs:3 },
  { id:'k-35', bereich:'Zutritt/Sicherheit', gefahr:'Personenschutz exponierter Teilnehmer (VIP/Regierung)', massnahme:'O: Abstimmung mit Polizei/Personenschützern, gesicherte Zonen und Routen · T: bauliche Sicherung', e:2, s:4, re:1, rs:4 },
  { id:'k-36', bereich:'Zutritt/Sicherheit', gefahr:'Einbringen gefährlicher Gegenstände', massnahme:'O: Einlass-/Taschenkontrolle nach Hausrecht · T: Detektionstechnik', e:2, s:4, re:1, rs:4 },
  { id:'k-37', bereich:'Zutritt/Sicherheit', gefahr:'Protest / Demonstration / Aktionen', massnahme:'O: Lagebild, Abstimmung Polizei, Deeskalation, Eingänge/Zufahrten sichern', e:2, s:3, re:1, rs:3 },

  /* ---- Messe / Ausstellung ---- */
  { id:'k-38', bereich:'Messe/Ausstellung', gefahr:'Standbau ohne Abnahme / Statik Doppelstockstand', massnahme:'O: Standbaurichtlinien, Genehmigung & Statiknachweis für Sonderbauten/Doppelstock, Standabnahme vor Eröffnung', e:2, s:4, re:1, rs:4 },
  { id:'k-39', bereich:'Messe/Ausstellung', gefahr:'Vorführungen/Maschinen am Stand (bewegte Teile)', massnahme:'T: CE-Schutzeinrichtungen, Not-Aus · O: Absperrung Publikum, Aufsicht durch eingewiesenes Personal', e:2, s:3, re:1, rs:3 },
  { id:'k-40', bereich:'Messe/Ausstellung', gefahr:'Gasflaschen / Druckbehälter / Druckluft am Stand', massnahme:'O: Genehmigung & Mengenbegrenzung, Sicherung gegen Umfallen, Dichtheitsprüfung · T: Abstand zu Zündquellen', e:2, s:4, re:1, rs:3 },

  /* ---- Catering / Hygiene ---- */
  { id:'k-41', bereich:'Catering/Hygiene', gefahr:'Catering: Rutschgefahr / Allergene / Hygiene', massnahme:'O: HACCP, Allergenkennzeichnung, Reinigung · T: rutschhemmende Beläge', e:3, s:2, re:2, rs:2 },
  { id:'k-42', bereich:'Catering/Hygiene', gefahr:'Lebensmittelvergiftung / Kühlkettenunterbrechung', massnahme:'O: HACCP, Kühlkettenkontrolle, Rückstellproben, zertifizierter Caterer', e:1, s:3, re:1, rs:3 },
  { id:'k-43', bereich:'Catering/Hygiene', gefahr:'Alkoholbedingte Vorfälle', massnahme:'O: Ausschankregeln, kein Ausschank an erkennbar Betrunkene, Ordnungsdienst, alkoholfreie Alternativen', e:2, s:2, re:1, rs:2 },

  /* ---- Beschäftigte ---- */
  { id:'k-44', bereich:'Beschäftigte', gefahr:'Lärm (Beschallung, Aufbau)', massnahme:'T: Lärmminderung, Abschirmung · O: Expositionszeiten begrenzen · P: Gehörschutz', e:3, s:2, re:2, rs:2 },
  { id:'k-45', bereich:'Beschäftigte', gefahr:'Heben/Tragen schwerer Lasten', massnahme:'T: Hebe-/Transporthilfen · O: Unterweisung ergonomisches Heben, Teamarbeit', e:3, s:2, re:2, rs:2 },
  { id:'k-46', bereich:'Beschäftigte', gefahr:'Psychische Belastung (Zeitdruck, Nacht-/Schichtarbeit)', massnahme:'O: realistische Zeitplanung, Pausen, Schichtgestaltung, ausreichend Personal', e:3, s:2, re:2, rs:2 },
  { id:'k-47', bereich:'Beschäftigte', gefahr:'Hitze / Kälte / Zugluft', massnahme:'T: Heizung/Lüftung, Wetterschutz · O: Getränke, Pausen · P: witterungsgerechte Kleidung', e:3, s:2, re:2, rs:1 },
  { id:'k-48', bereich:'Beschäftigte', gefahr:'Belastung Stand-/Servicepersonal (Stehen, Lärm, Stress)', massnahme:'O: Pausen, Schichtwechsel, Sitzgelegenheiten · T: Lärmminderung', e:3, s:1, re:2, rs:1 },

  /* ---- Außen / Witterung ---- */
  { id:'k-49', bereich:'Außen/Witterung', gefahr:'Witterung: Wind/Sturm/Last auf Zelten/Bühnen', massnahme:'S: Verzicht auf Außenaufbau · T: Ballastierung, Verankerung · O: Windlast-/Abbruchkriterien, Wettermonitoring', e:2, s:4, re:1, rs:4 },
  { id:'k-50', bereich:'Außen/Witterung', gefahr:'Rutsch-/Sturzgefahr (Nässe, Schnee, Glätte)', massnahme:'T: rutschhemmende Beläge, Abstreifer · O: Räum-/Streudienst, Markierung', e:3, s:2, re:2, rs:2 },

  /* ---- Logistik / Verkehr ---- */
  { id:'k-51', bereich:'Logistik/Verkehr', gefahr:'Anfahren durch Stapler/Hubwagen', massnahme:'T: getrennte Verkehrs-/Fußwege · O: Verkehrsregelung, Einweiser · P: Warnkleidung', e:3, s:3, re:1, rs:3 },
  { id:'k-52', bereich:'Logistik/Verkehr', gefahr:'Gefährdung in Ladezone / beim Rangieren', massnahme:'O: gesicherte Ladezone, Einweiser, Rückfahrwarnung · T: Abstützung/Ladungssicherung', e:2, s:3, re:1, rs:3 },

  /* ---- Gefahrstoffe ---- */
  { id:'k-53', bereich:'Gefahrstoffe', gefahr:'Nebelfluid / Reinigungsmittel / Treibstoff', massnahme:'S: Ersatzstoffe · O: Sicherheitsdatenblätter, sichere Lagerung, Lüftung · P: ggf. Handschutz', e:2, s:2, re:1, rs:2 },

  /* ---- Inklusion ---- */
  { id:'k-54', bereich:'Inklusion', gefahr:'Mobilitätseingeschränkte Personen bei Räumung', massnahme:'O: Evakuierungshelfer, Sammelpunkte, Buddy-System · T: Evakuierungsstühle, barrierefreie Wege', e:2, s:4, re:1, rs:3 },

  /* ---- Notfall / Gefahrenabwehr ---- */
  { id:'k-55', bereich:'Notfall/Gefahrenabwehr', gefahr:'Medizinischer Notfall / MANV', massnahme:'O: Sanitätsdienst vor Ort, AED-Standorte, Alarmierungskette, RTW-Zufahrt frei · T: AED bereitstellen', e:3, s:3, re:2, rs:3 },
  { id:'k-56', bereich:'Notfall/Gefahrenabwehr', gefahr:'Unzureichende Alarmierung / Räumungsdurchsage', massnahme:'T: ELA/Sprachalarmierung flächendeckend, geprüft · O: vorbereitete, mehrsprachige Durchsagetexte', e:2, s:4, re:1, rs:4 },
  { id:'k-57', bereich:'Notfall/Gefahrenabwehr', gefahr:'Bedrohung / Bombendrohung / Angriff', massnahme:'O: Zutritts-/Einlasskontrolle, Schulung, Notfallplan mit Polizei · T: Detektion/Absperrung', e:2, s:4, re:1, rs:4 },
  { id:'k-58', bereich:'Notfall/Gefahrenabwehr', gefahr:'Ausfall Ticketing/IT/WLAN mit Stau-/Sicherheitsfolge', massnahme:'T: Redundanz, Offline-Fallback · O: manuelle Einlassprozesse, Kommunikationsplan', e:2, s:2, re:1, rs:2 }
];

/* ------------------------------------------------------------
   Konzept-Formulardefinitionen (Felder mit Platzhaltern)
   ------------------------------------------------------------ */
const FORM_DEFS = {
  ordnungsdienst: [
    ['leitung',      'Verantwortliche Leitung', 'Verantwortliche Leitung des Ordnungsdienstes (Anwesenheitspflicht während der Veranstaltung) …'],
    ['personal',     'Dienstleister / eigenes Personal', 'Beauftragter Dienstleister bzw. eigenes Personal (Bewachung nach § 34a GewO, Objektkenntnis) …'],
    ['bemessung',    'Personalbemessung', 'Anzahl Kräfte – abhängig von Besucherzahl, Risiko und Vorgabe des Hauses/der Behörde (Verfahren benennen, nicht hier ausrechnen) …'],
    ['postenplan',   'Postenplan / Einsatzbereiche', 'Postenplan und Einsatzbereiche (Eingänge, Säle, Rettungswege, Außenflächen) …'],
    ['aufgaben',     'Aufgaben', 'Zutrittskontrolle, Einlasssteuerung, Freihaltung der Rettungswege, Kapazitätsüberwachung, Deeskalation, Räumungsunterstützung …'],
    ['kommunikation','Kommunikation / Führung', 'Funkkonzept, Meldewege, Führungsstruktur, Schnittstelle zu Polizei/Feuerwehr …'],
    ['briefing',     'Einweisung / Briefing', 'Einweisung und Briefing vor Dienstbeginn (Objekt, Szenarien, Meldewege) …']
  ],
  sanitaetsdienst: [
    ['dienst',       'Beauftragter Dienst', 'Beauftragter Sanitäts-/Rettungsdienst (Organisation, Ansprechpartner) …'],
    ['bemessung',    'Bemessungsgrundlage', 'Bemessung nach Kölner Algorithmus bzw. Maurer-Schema – Verfahren benennen; konkrete Werte mit Rettungsdienst/Behörde abstimmen (hier nicht ausrechnen) …'],
    ['personal',     'Personal & Qualifikation', 'Vorgesehene Qualifikationen (Sanitätshelfer, Rettungssanitäter, Notfallsanitäter, Arzt) …'],
    ['material',     'Material & AED', 'Sanitätsmaterial, AED-Standorte, Trage-/Transportmittel …'],
    ['raum',         'Sanitätsraum / Standorte', 'Sanitätsraum/UHS und mobile Standorte (Lage, Kennzeichnung, Erreichbarkeit) …'],
    ['rettungswege', 'Rettungswege / RTW-Anfahrt', 'Rettungswege im Haus, RTW-Anfahrt und Übergabepunkte (frei zu halten) …'],
    ['eskalation',   'Eskalation / MANV', 'Eskalationsstufen, Nachforderung Regelrettungsdienst, Stichwort MANV …']
  ],
  brandschutz: [
    ['baulich',     'Baulicher / anlagentechnischer Brandschutz', 'Brandschutz des Hauses: BMA, Sprinkler, RWA, Brandabschnitte …'],
    ['brandlasten', 'Veranstaltungsbezogene Brandlasten', 'Zusätzliche Brandlasten (Deko, Standbau) und B1-Nachweis …'],
    ['fluchtwege',  'Flucht- / Rettungswege', 'Breiten, Kapazität, Entfluchtungszeit, Bestuhlungsplan …'],
    ['feuergefahr', 'Feuergefährliche Handlungen', 'Pyrotechnik, offene Flamme, Brandsicherheitswache (Genehmigung, befähigte Person) …'],
    ['loeschmittel','Löschmittel & Erstmaßnahmen', 'Feuerlöscher, Wandhydranten, Standorte, Erstmaßnahmen, Unterweisung …'],
    ['alarmierung', 'Alarmierung & Räumung', 'BMA, ELA/Sprachalarmierung, Räumungsdurchsage, Räumungshelfer …'],
    ['feuerwehr',   'Feuerwehr-Schnittstelle', 'Zufahrten, Aufstellflächen, Feuerwehrplan, Ansprechpartner …']
  ]
};

/* ------------------------------------------------------------
   Default-Notfallszenarien
   ------------------------------------------------------------ */
const NOTFALL_DEFAULT = [
  { id:'nf-1', titel:'Brand im Saal/Foyer', ausloeser:'Brandmeldung / Auslösung BMA / Rauch- oder Feuererkennung',
    sofort:'Alarmierung auslösen, Erstbekämpfung mit Feuerlöscher (nur ohne Eigengefährdung), Räumungsdurchsage über ELA',
    verantwortlich:'Veranstaltungsleiter / Brandschutzbeauftragter', eskalation:'Feuerwehr 112, Teil-/Vollräumung, Sammelplatz, Einsatzkräfte einweisen' },
  { id:'nf-2', titel:'Vollräumung', ausloeser:'Anordnung durch Leitung oder Behörde',
    sofort:'Räumungsdurchsage, alle Ausgänge öffnen, Ordnungsdienst lenkt Personenströme zu den Notausgängen',
    verantwortlich:'Veranstaltungsleiter', eskalation:'Sammelplatz-Kontrolle, Vollzähligkeit prüfen, Rückmeldung an Einsatzkräfte' },
  { id:'nf-3', titel:'Med. Notfall / MANV', ausloeser:'Person(en) verletzt oder kollabiert',
    sofort:'Sanitätsdienst alarmieren, Bereich sichern und freihalten, AED bereitstellen, Ersthelfer',
    verantwortlich:'Sanitätsdienstleitung', eskalation:'Regelrettungsdienst nachfordern, Zufahrt frei halten, ggf. Stichwort MANV' },
  { id:'nf-4', titel:'Stromausfall', ausloeser:'Netz- oder Technikausfall',
    sofort:'Sicherheitsbeleuchtung prüfen, ruhige Durchsage, Programm pausieren',
    verantwortlich:'Technische Leitung', eskalation:'Bei Ausfall sicherheitsrelevanter Technik Räumung erwägen, Netzersatz/USV prüfen' },
  { id:'nf-5', titel:'Bedrohung / Bombendrohung', ausloeser:'Drohung, verdächtiger Gegenstand oder Angriff',
    sofort:'Polizei 110, nichts berühren, ggf. Räumung nach Absprache, Bereich absichern',
    verantwortlich:'Veranstaltungsleiter + Polizei', eskalation:'Lageabhängig Räumung, Absperrung, Übergabe an Einsatzkräfte' },
  { id:'nf-6', titel:'Unwetter / Sturm (außen)', ausloeser:'Wetterwarnung oder Überschreiten des Windgrenzwerts',
    sofort:'Abbruchkriterien anwenden, Außenflächen räumen, Aufbauten sichern',
    verantwortlich:'Veranstaltungsleiter', eskalation:'Verlagerung nach innen oder Abbruch, Besucherlenkung' }
];

/* ============================================================
   State
   ============================================================ */
const TABS = ['gefaehrdung', 'massnahmen', 'ordnungsdienst', 'sanitaetsdienst', 'brandschutz', 'notfall', 'glossar'];
const RISK_KEYS = ['alle', 'green', 'yellow', 'orange', 'red', 'offen'];
const SORT_KEYS = ['katalog', 'risiko', 'rest', 'bereich'];

let state = null;
let searchTerm = '';          // Suchbegriff (bewusst nicht gespeichert)

function defaultState() {
  return {
    version: 3,
    meta: { veranstaltung:'', ort:'', datum:'', besucher:'', ersteller:'', stand:'' },
    activeTab: 'gefaehrdung',
    filterBereich: 'alle',
    filterRisk: 'alle',
    filterCell: null,          // "E-S" aus der Risikomatrix oder null
    matrixMode: 'risk',        // 'risk' = ohne Maßnahme, 'rest' = mit Maßnahme
    sortBy: 'katalog',
    nurOffene: false,
    gefaehrdungen: KATALOG.map(toGefItem),
    concepts: { ordnungsdienst:{}, sanitaetsdienst:{}, brandschutz:{} },
    notfall: NOTFALL_DEFAULT.map(n => ({ ...n }))
  };
}

/* Katalogeintrag -> Arbeitsobjekt */
function toGefItem(c) {
  return {
    id: c.id, catalog: 'katalog',
    bereich: c.bereich, gefahr: c.gefahr, massnahme: c.massnahme,
    e: c.e, s: c.s, re: c.re, rs: c.rs,
    verantwortlich: '', termin: '', erledigt: false, vorschlag: true
  };
}

/* ============================================================
   Persistenz
   ============================================================ */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus(true);
  } catch (e) {
    console.warn('Speichern fehlgeschlagen', e);
    setSaveStatus(false);
  }
}

function setSaveStatus(ok) {
  const el = document.getElementById('save-status');
  if (!el) return;
  const t = new Date().toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
  el.textContent = ok ? 'Gespeichert · ' + t + ' Uhr' : 'Speichern nicht möglich – bitte JSON exportieren';
  el.classList.toggle('is-error', !ok);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return mergeState(JSON.parse(raw));
  } catch (e) {
    console.warn('Laden fehlgeschlagen, Standard wird verwendet', e);
    return defaultState();
  }
}

function str(v) { return v == null ? '' : String(v); }
function clamp14(v, fallback) {
  const n = parseInt(v, 10);
  return n >= 1 && n <= 4 ? n : fallback;
}

function sanitizeGef(g, seen) {
  if (!g || typeof g !== 'object') return null;
  let id = str(g.id);
  if (!id || seen.has(id)) id = uid('c-');
  seen.add(id);
  return {
    id,
    catalog: g.catalog === 'katalog' ? 'katalog' : 'custom',
    bereich: KATEGORIEN.includes(g.bereich) ? g.bereich : 'Sonstige',
    gefahr: str(g.gefahr), massnahme: str(g.massnahme),
    e: clamp14(g.e, 1), s: clamp14(g.s, 1), re: clamp14(g.re, 1), rs: clamp14(g.rs, 1),
    verantwortlich: str(g.verantwortlich),
    termin: /^\d{4}-\d{2}-\d{2}$/.test(str(g.termin)) ? g.termin : '',
    erledigt: !!g.erledigt, vorschlag: !!g.vorschlag
  };
}

function sanitizeNotfall(n, seen) {
  if (!n || typeof n !== 'object') return null;
  let id = str(n.id);
  if (!id || seen.has(id)) id = uid('nf-');
  seen.add(id);
  return {
    id, titel: str(n.titel), ausloeser: str(n.ausloeser), sofort: str(n.sofort),
    verantwortlich: str(n.verantwortlich), eskalation: str(n.eskalation)
  };
}

/* defensiv: fehlende/ungültige Felder ergänzen bzw. bereinigen.
   Altstände (version 1, getrennte Kataloge) werden auf den
   zusammengeführten Katalog migriert. */
function mergeState(p) {
  const d = defaultState();
  if (!p || typeof p !== 'object') return d;

  const meta = {};
  Object.keys(d.meta).forEach(k => { meta[k] = str(p.meta && p.meta[k]); });

  const concepts = {};
  Object.keys(FORM_DEFS).forEach(key => {
    const src = (p.concepts && p.concepts[key]) || {};
    concepts[key] = {};
    FORM_DEFS[key].forEach(([field]) => { if (src[field]) concepts[key][field] = str(src[field]); });
  });

  const migriert = !p.version || p.version < 2 || !Array.isArray(p.gefaehrdungen);
  const seenG = new Set(), seenN = new Set();

  return {
    version: 3,
    meta,
    activeTab: TABS.includes(p.activeTab) ? p.activeTab : 'gefaehrdung',
    filterBereich: KATEGORIEN.includes(p.filterBereich) ? p.filterBereich : 'alle',
    filterRisk: RISK_KEYS.includes(p.filterRisk) ? p.filterRisk : 'alle',
    filterCell: /^[1-4]-[1-4]$/.test(str(p.filterCell)) ? p.filterCell : null,
    matrixMode: p.matrixMode === 'rest' ? 'rest' : 'risk',
    sortBy: SORT_KEYS.includes(p.sortBy) ? p.sortBy : 'katalog',
    nurOffene: !!p.nurOffene,
    gefaehrdungen: migriert ? d.gefaehrdungen : p.gefaehrdungen.map(g => sanitizeGef(g, seenG)).filter(Boolean),
    concepts,
    notfall: Array.isArray(p.notfall) ? p.notfall.map(n => sanitizeNotfall(n, seenN)).filter(Boolean) : d.notfall
  };
}

/* ============================================================
   Hilfsfunktionen
   ============================================================ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function $(id) { return document.getElementById(id); }

function riskOf(g) { return g.e * g.s; }
function restOf(g) { return g.re * g.rs; }
function levelOf(v) {
  if (v <= 3) return 'green';
  if (v <= 6) return 'yellow';
  if (v <= 9) return 'orange';
  return 'red';
}
function riskClass(v) { return 'r-' + levelOf(v); }
function riskLabel(v) {
  return { green:'gering', yellow:'mittel', orange:'hoch', red:'sehr hoch' }[levelOf(v)];
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function isOverdue(g) { return !!g.termin && !g.erledigt && g.termin < todayISO(); }
function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
}

/* ============================================================
   Filter / Sortierung
   ============================================================ */
function matchRisk(g) {
  const r = riskOf(g);
  switch (state.filterRisk) {
    case 'green':  return r <= 3;
    case 'yellow': return r >= 4 && r <= 6;
    case 'orange': return r >= 7 && r <= 9;
    case 'red':    return r >= 10;
    case 'offen':  return r >= 7 && !g.erledigt;
    default:       return true;
  }
}
function matchCell(g) {
  if (!state.filterCell) return true;
  const [e, s] = state.filterCell.split('-').map(Number);
  return state.matrixMode === 'rest' ? (g.re === e && g.rs === s) : (g.e === e && g.s === s);
}
function matchSearch(g) {
  if (!searchTerm) return true;
  const hay = (g.bereich + ' ' + g.gefahr + ' ' + g.massnahme + ' ' + g.verantwortlich).toLowerCase();
  return searchTerm.split(/\s+/).every(t => hay.includes(t));
}
function filtersActive() {
  return state.filterBereich !== 'alle' || state.filterRisk !== 'alle' || !!state.filterCell || !!searchTerm;
}
function filteredGef() {
  const list = state.gefaehrdungen.filter(g =>
    (state.filterBereich === 'alle' || g.bereich === state.filterBereich) &&
    matchRisk(g) && matchCell(g) && matchSearch(g));
  switch (state.sortBy) {
    case 'risiko':  list.sort((a, b) => riskOf(b) - riskOf(a)); break;
    case 'rest':    list.sort((a, b) => restOf(b) - restOf(a)); break;
    case 'bereich': list.sort((a, b) => KATEGORIEN.indexOf(a.bereich) - KATEGORIEN.indexOf(b.bereich)); break;
  }
  return list;
}

/* ============================================================
   Rendering: Gefährdungstabelle
   ============================================================ */
function selectOptions(selected) {
  return [1,2,3,4].map(n => `<option value="${n}"${n===selected?' selected':''}>${n}</option>`).join('');
}
function bereichOptions(selected) {
  return KATEGORIEN.map(k => `<option value="${esc(k)}"${k===selected?' selected':''}>${esc(k)}</option>`).join('');
}

function badgeHTML(v) {
  return `<span class="risk-badge ${riskClass(v)}">${v}</span><span class="risk-word">${riskLabel(v)}</span>`;
}
function riskMetaHTML(g) {
  return badgeHTML(riskOf(g)) + (g.vorschlag ? '<span class="tag">Vorschlag</span>' : '');
}
function restMetaHTML(g) {
  const risk = riskOf(g), rest = restOf(g);
  let warn = '';
  if (rest > risk) warn = '<span class="tag tag--warn" title="Das Restrisiko darf nicht über dem Ausgangsrisiko liegen.">höher als Risiko</span>';
  else if (rest >= 7) warn = '<span class="tag tag--warn" title="Restrisiko weiterhin hoch – Maßnahme verbessern (STOP-Prinzip).">Maßnahme reicht nicht</span>';
  return badgeHTML(rest) + warn;
}

function rowHTML(g) {
  return `<tr data-id="${esc(g.id)}"${g.erledigt ? ' class="is-done"' : ''}>
    <td class="col-bereich"><select class="cell-select" data-field="bereich" aria-label="Bereich">${bereichOptions(g.bereich)}</select></td>
    <td><textarea class="cell-input" data-field="gefahr" rows="1" aria-label="Gefährdung" placeholder="Gefährdung beschreiben …">${esc(g.gefahr)}</textarea></td>
    <td><textarea class="cell-input" data-field="massnahme" rows="1" aria-label="Schutzmaßnahme" placeholder="S: … · T: … · O: … · P: …">${esc(g.massnahme)}</textarea></td>
    <td class="risk-cell" data-cell="risk">
      <div class="risk-selects">
        <select data-field="e" aria-label="Eintrittswahrscheinlichkeit">${selectOptions(g.e)}</select>
        <span class="mul">×</span>
        <select data-field="s" aria-label="Schwere">${selectOptions(g.s)}</select>
      </div>
      <div class="risk-meta">${riskMetaHTML(g)}</div>
    </td>
    <td class="risk-cell" data-cell="rest">
      <div class="risk-selects">
        <select data-field="re" aria-label="Eintrittswahrscheinlichkeit mit Maßnahme">${selectOptions(g.re)}</select>
        <span class="mul">×</span>
        <select data-field="rs" aria-label="Schwere mit Maßnahme">${selectOptions(g.rs)}</select>
      </div>
      <div class="risk-meta">${restMetaHTML(g)}</div>
    </td>
    <td class="col-verant"><input class="cell-input" type="text" data-field="verantwortlich" value="${esc(g.verantwortlich)}" aria-label="Verantwortlich" placeholder="Name / Funktion"></td>
    <td class="col-done"><input class="done-check" type="checkbox" data-field="erledigt" ${g.erledigt?'checked':''} aria-label="erledigt"></td>
    <td class="col-act no-print"><button type="button" class="row-del" data-action="del" title="Zeile löschen" aria-label="Zeile löschen">×</button></td>
  </tr>`;
}

function renderGefTable() {
  const tbody = $('gef-tbody');
  const list = filteredGef();
  tbody.innerHTML = list.length
    ? list.map(rowHTML).join('')
    : `<tr><td colspan="8" class="empty-row">Keine Einträge für diese Auswahl.</td></tr>`;
  renderFilterInfo(list.length);
  autosize($('tab-gefaehrdung'));
}

/* nur Badges/Hinweise einer Zeile aktualisieren (Fokus bleibt erhalten) */
function updateRowMeta(tr, g) {
  const risk = tr.querySelector('[data-cell="risk"] .risk-meta');
  const rest = tr.querySelector('[data-cell="rest"] .risk-meta');
  if (risk) risk.innerHTML = riskMetaHTML(g);
  if (rest) rest.innerHTML = restMetaHTML(g);
}

/* ============================================================
   Rendering: Filterchips + Filterinfo
   ============================================================ */
function renderFilterBar() {
  const list = state.gefaehrdungen;
  const counts = {};
  list.forEach(g => { counts[g.bereich] = (counts[g.bereich] || 0) + 1; });

  const chip = (key, label, n) =>
    `<button type="button" class="chip${state.filterBereich===key?' is-active':''}" data-filter="${esc(key)}" aria-pressed="${state.filterBereich===key}">${esc(label)}<span class="chip-count">${n}</span></button>`;

  let html = chip('alle', 'Alle', list.length);
  KATEGORIEN.forEach(k => { if (counts[k]) html += chip(k, k, counts[k]); });
  $('filter-bar').innerHTML = html;
}

function renderFilterInfo(shown) {
  const total = state.gefaehrdungen.length;
  const parts = [];
  if (state.filterBereich !== 'alle') parts.push('Bereich: ' + state.filterBereich);
  if (state.filterRisk !== 'alle') {
    parts.push({ green:'Risiko gering', yellow:'Risiko mittel', orange:'Risiko hoch', red:'Risiko sehr hoch', offen:'offene Maßnahmen' }[state.filterRisk]);
  }
  if (state.filterCell) {
    const [e, s] = state.filterCell.split('-');
    parts.push(`Matrix ${state.matrixMode === 'rest' ? 'Restrisiko' : 'Risiko'} E${e} × S${s}`);
  }
  if (searchTerm) parts.push('Suche: „' + searchTerm + '“');

  $('filter-info').innerHTML =
    `<span><strong>${shown}</strong> von ${total} Gefährdungen</span>` +
    parts.map(p => `<span class="filter-tag">${esc(p)}</span>`).join('') +
    (parts.length ? '<button type="button" class="link-btn no-print" data-action="clear-filters">Filter zurücksetzen</button>' : '');
}

/* ============================================================
   Rendering: Dashboard + Fortschritt
   ============================================================ */
function renderDashboard() {
  const list = state.gefaehrdungen;
  const risk = { green:0, yellow:0, orange:0, red:0 };
  const rest = { green:0, yellow:0, orange:0, red:0 };
  let offen = 0, erledigt = 0;
  list.forEach(g => {
    risk[levelOf(riskOf(g))]++;
    rest[levelOf(restOf(g))]++;
    if (riskOf(g) >= 7 && !g.erledigt) offen++;
    if (g.erledigt) erledigt++;
  });

  const cards = [
    ['green',  'gering',    '1–3'],
    ['yellow', 'mittel',    '4–6'],
    ['orange', 'hoch',      '7–9'],
    ['red',    'sehr hoch', '10–16']
  ].map(([key, label, range]) => {
    const active = state.filterRisk === key;
    return `<button type="button" class="dash-card is-${key}${active ? ' is-selected' : ''}" data-risk="${key}" aria-pressed="${active}" title="Tabelle nach dieser Risikostufe filtern">
      <span class="dash-num">${risk[key]}</span>
      <span class="dash-label">${label} <span class="dash-range">${range}</span></span>
      <span class="dash-sub">mit Maßnahmen: <b>${rest[key]}</b></span>
    </button>`;
  });

  const activeOpen = state.filterRisk === 'offen';
  cards.push(`<button type="button" class="dash-card is-open${activeOpen ? ' is-selected' : ''}" data-risk="offen" aria-pressed="${activeOpen}" title="Tabelle nach offenen Maßnahmen filtern">
      <span class="dash-num">${offen}</span>
      <span class="dash-label">offene Maßnahmen</span>
      <span class="dash-sub">Risiko ≥ 7, nicht erledigt</span>
    </button>`);
  $('dashboard').innerHTML = cards.join('');

  const pct = list.length ? Math.round(erledigt / list.length * 100) : 0;
  $('progress').innerHTML =
    `<div class="progress__head"><span>Maßnahmen umgesetzt</span><span><b>${erledigt}</b> von ${list.length} · ${pct} %</span></div>
     <div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Maßnahmen umgesetzt"><div class="progress__bar" style="width:${pct}%"></div></div>`;
}

/* ============================================================
   Rendering: Risikomatrix 4x4 (interaktiv)
   ============================================================ */
function renderMatrix() {
  const rest = state.matrixMode === 'rest';
  const counts = {};
  state.gefaehrdungen.forEach(g => {
    const key = rest ? g.re + '-' + g.rs : g.e + '-' + g.s;
    counts[key] = (counts[key] || 0) + 1;
  });

  let html = '<table class="matrix"><tbody>';
  for (let s = 4; s >= 1; s--) {
    html += `<tr><th scope="row">${s}</th>`;
    for (let e = 1; e <= 4; e++) {
      const v = e * s, key = e + '-' + s, n = counts[key] || 0;
      const sel = state.filterCell === key;
      html += `<td><button type="button" class="matrix-cell ${riskClass(v)}${sel ? ' is-selected' : ''}${n ? '' : ' is-empty'}" data-cell="${key}" aria-pressed="${sel}"
        title="E ${e} × S ${s} = ${v} (${riskLabel(v)}) · ${n} Gefährdung${n === 1 ? '' : 'en'}">
        <span class="matrix-val">${v}</span><span class="matrix-count">${n || ''}</span></button></td>`;
    }
    html += '</tr>';
  }
  html += '<tr><th></th>';
  for (let e = 1; e <= 4; e++) html += `<th scope="col">${e}</th>`;
  html += '</tr></tbody></table>';
  $('matrix').innerHTML = html;

  document.querySelectorAll('#matrix-mode [data-mode]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.mode === state.matrixMode));
  });
}

/* ============================================================
   Rendering: Maßnahmenplan
   ============================================================ */
/* "S: … · T: …" als gekennzeichnete STOP-Liste darstellen */
function stopHTML(text) {
  const parts = String(text || '').split(/\s+·\s+/).filter(Boolean);
  if (!parts.length) return '<span class="muted">–</span>';
  return '<ul class="stop-list">' + parts.map(p => {
    const m = /^([STOP]):\s*(.*)$/.exec(p);
    return m
      ? `<li><span class="stop stop-${m[1]}" title="${{S:'Substitution',T:'Technisch',O:'Organisatorisch',P:'Persönlich'}[m[1]]}">${m[1]}</span><span>${esc(m[2])}</span></li>`
      : `<li><span class="stop stop-none"></span><span>${esc(p)}</span></li>`;
  }).join('') + '</ul>';
}

function renderMassnahmen() {
  const tbody = $('mass-tbody');
  let list = state.gefaehrdungen.slice().sort((a, b) => restOf(b) - restOf(a));
  const offen = list.filter(g => !g.erledigt).length;
  const overdue = list.filter(isOverdue).length;
  if (state.nurOffene) list = list.filter(g => !g.erledigt);

  $('chk-offene').checked = state.nurOffene;
  $('mass-info').innerHTML = `<strong>${offen}</strong> offen · ${state.gefaehrdungen.length - offen} erledigt` +
    (overdue ? ` · <span class="text-warn">${overdue} überfällig</span>` : '');

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">${state.nurOffene ? 'Alle Maßnahmen sind erledigt.' : 'Keine Maßnahmen vorhanden.'}</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(g => {
    const rest = restOf(g);
    return `<tr data-id="${esc(g.id)}" class="${g.erledigt ? 'is-done' : ''}${isOverdue(g) ? ' is-overdue' : ''}">
      <td><span class="cell-kicker">${esc(g.bereich)}</span>${esc(g.gefahr) || '<span class="muted">–</span>'}</td>
      <td>${stopHTML(g.massnahme)}</td>
      <td class="risk-cell"><div class="risk-meta">${badgeHTML(rest)}</div></td>
      <td class="col-verant"><input class="cell-input" type="text" data-field="verantwortlich" value="${esc(g.verantwortlich)}" aria-label="Verantwortlich" placeholder="Name / Funktion"></td>
      <td class="col-termin"><input class="cell-input${g.termin ? '' : ' is-empty'}" type="date" data-field="termin" value="${esc(g.termin)}" aria-label="Termin"><span class="overdue-note">überfällig</span></td>
      <td class="col-done"><input class="done-check" type="checkbox" data-field="erledigt" ${g.erledigt?'checked':''} aria-label="erledigt"></td>
    </tr>`;
  }).join('');
}

/* ============================================================
   Rendering: Konzept-Formulare
   ============================================================ */
function renderForms() {
  Object.keys(FORM_DEFS).forEach(key => {
    const container = $('form-' + key);
    if (!container) return;
    const data = state.concepts[key] || {};
    container.innerHTML = FORM_DEFS[key].map(([field, label, placeholder], i) =>
      `<div class="form-field">
        <label for="f-${key}-${field}"><span class="form-num">${i + 1}</span>${esc(label)}</label>
        <textarea id="f-${key}-${field}" data-form="${key}" data-field="${field}" rows="2" placeholder="${esc(placeholder)}">${esc(data[field] || '')}</textarea>
      </div>`).join('');
  });
}

/* ============================================================
   Rendering: Notfallkarten
   ============================================================ */
function renderNotfall() {
  const grid = $('notfall-grid');
  if (!state.notfall.length) {
    grid.innerHTML = '<p class="empty-row">Noch keine Szenarien angelegt.</p>';
    return;
  }
  const field = (n, key, label) =>
    `<div class="nf-field"><label for="nf-${esc(n.id)}-${key}">${label}</label><textarea id="nf-${esc(n.id)}-${key}" data-field="${key}" rows="1">${esc(n[key])}</textarea></div>`;
  grid.innerHTML = state.notfall.map((n, i) =>
    `<article class="nf-card" data-id="${esc(n.id)}">
      <div class="nf-card__head">
        <span class="nf-num">${String(i + 1).padStart(2, '0')}</span>
        <input type="text" data-field="titel" value="${esc(n.titel)}" aria-label="Titel des Szenarios" placeholder="Titel">
        <button type="button" class="row-del no-print" data-action="del-nf" title="Szenario löschen" aria-label="Szenario löschen">×</button>
      </div>
      ${field(n, 'ausloeser', 'Auslöser')}
      ${field(n, 'sofort', 'Sofortmaßnahmen')}
      ${field(n, 'verantwortlich', 'Verantwortlich')}
      ${field(n, 'eskalation', 'Eskalation')}
    </article>`).join('');
}

/* ============================================================
   Rendering: Metadaten / Tab-Zähler / Katalog-Button
   ============================================================ */
const META_FIELDS = ['veranstaltung', 'ort', 'datum', 'besucher', 'ersteller', 'stand'];

function renderMeta() {
  META_FIELDS.forEach(f => { $('meta-' + f).value = state.meta[f]; });
  $('gef-search').value = searchTerm;
  $('gef-sort').value = state.sortBy;
}

function renderBadges() {
  const set = (tab, text) => {
    const el = document.querySelector(`[data-badge="${tab}"]`);
    if (el) { el.textContent = text; el.hidden = text === ''; }
  };
  set('gefaehrdung', String(state.gefaehrdungen.length));
  const offen = state.gefaehrdungen.filter(g => !g.erledigt).length;
  set('massnahmen', offen ? offen + ' offen' : '✓');
  Object.keys(FORM_DEFS).forEach(key => {
    const data = state.concepts[key] || {};
    const filled = FORM_DEFS[key].filter(([f]) => (data[f] || '').trim()).length;
    set(key, filled + '/' + FORM_DEFS[key].length);
  });
  set('notfall', String(state.notfall.length));

  const ids = new Set(state.gefaehrdungen.map(g => g.id));
  const missing = KATALOG.filter(c => !ids.has(c.id)).length;
  const btn = $('btn-restore');
  btn.hidden = missing === 0;
  btn.textContent = `Katalog ergänzen (${missing})`;
}

/* zentraler Re-Render der Gefährdungs-relevanten Teile */
function renderGefAll() {
  renderFilterBar();
  renderDashboard();
  renderMatrix();
  renderGefTable();
  renderMassnahmen();
  renderBadges();
}

function renderAll() {
  renderMeta();
  renderForms();
  renderNotfall();
  renderGefAll();
  setActiveTab(state.activeTab, false);
}

/* ============================================================
   Textareas automatisch an den Inhalt anpassen
   ============================================================ */
function autosize(root) {
  const els = Array.from((root || document).querySelectorAll('textarea')).filter(t => t.offsetParent !== null);
  els.forEach(t => { t.style.height = 'auto'; });
  const heights = els.map(t => t.scrollHeight);
  els.forEach((t, i) => { t.style.height = (heights[i] + 2) + 'px'; });
}
function autosizeOne(t) {
  t.style.height = 'auto';
  t.style.height = (t.scrollHeight + 2) + 'px';
}

/* ============================================================
   Tabs
   ============================================================ */
function setActiveTab(tab, save = true) {
  if (!TABS.includes(tab)) tab = TABS[0];
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    const on = b.dataset.tab === tab;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  document.querySelectorAll('.tab-section').forEach(s => {
    s.classList.toggle('is-active', s.id === 'tab-' + tab);
  });
  if (tab === 'massnahmen') renderMassnahmen();
  autosize($('tab-' + tab));
  if (save) saveState();
}

/* ============================================================
   Toast (mit optionaler Rückgängig-Aktion)
   ============================================================ */
let toastTimer = null;
function toast(msg, actionLabel, action) {
  const el = $('toast');
  el.textContent = '';
  const span = document.createElement('span');
  span.textContent = msg;
  el.appendChild(span);
  if (action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => { hideToast(); action(); });
    el.appendChild(btn);
  }
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, action ? 8000 : 3500);
}
function hideToast() { clearTimeout(toastTimer); $('toast').hidden = true; }

/* ============================================================
   Mutationen
   ============================================================ */
function findGef(id) { return state.gefaehrdungen.find(g => g.id === id); }

function clearFilters(keepBereich) {
  if (!keepBereich) state.filterBereich = 'alle';
  state.filterRisk = 'alle';
  state.filterCell = null;
  searchTerm = '';
  $('gef-search').value = '';
}

function addGefRow() {
  const item = {
    id: uid('c-'), catalog: 'custom',
    bereich: state.filterBereich !== 'alle' ? state.filterBereich : 'Sonstige',
    gefahr: '', massnahme: '', e: 1, s: 1, re: 1, rs: 1,
    verantwortlich: '', termin: '', erledigt: false, vorschlag: false
  };
  state.gefaehrdungen.push(item);
  clearFilters(true);            // neue Zeile muss sichtbar sein
  renderGefAll();
  saveState();
  const tr = document.querySelector(`#gef-tbody tr[data-id="${cssEscape(item.id)}"]`);
  if (tr) {
    tr.scrollIntoView({ block: 'center' });
    const ta = tr.querySelector('textarea');
    if (ta) ta.focus({ preventScroll: true });
  }
}

function deleteGefRow(id) {
  const idx = state.gefaehrdungen.findIndex(g => g.id === id);
  if (idx < 0) return;
  const [item] = state.gefaehrdungen.splice(idx, 1);
  renderGefAll();
  saveState();
  toast('Gefährdung gelöscht.', 'Rückgängig', () => {
    state.gefaehrdungen.splice(Math.min(idx, state.gefaehrdungen.length), 0, item);
    renderGefAll();
    saveState();
  });
}

function restoreKatalog() {
  const ids = new Set(state.gefaehrdungen.map(g => g.id));
  const missing = KATALOG.filter(c => !ids.has(c.id));
  if (!missing.length) return;
  state.gefaehrdungen.push(...missing.map(toGefItem));
  renderGefAll();
  saveState();
  toast(`${missing.length} Katalogeintr${missing.length === 1 ? 'ag' : 'äge'} wieder ergänzt.`);
}

function addNotfall() {
  const item = { id: uid('nf-'), titel:'', ausloeser:'', sofort:'', verantwortlich:'', eskalation:'' };
  state.notfall.push(item);
  renderNotfall();
  renderBadges();
  autosize($('tab-notfall'));
  saveState();
  const card = document.querySelector(`.nf-card[data-id="${cssEscape(item.id)}"]`);
  if (card) {
    card.scrollIntoView({ block: 'center' });
    card.querySelector('input').focus({ preventScroll: true });
  }
}

function deleteNotfall(id) {
  const idx = state.notfall.findIndex(n => n.id === id);
  if (idx < 0) return;
  const [item] = state.notfall.splice(idx, 1);
  const rerender = () => { renderNotfall(); renderBadges(); autosize($('tab-notfall')); saveState(); };
  rerender();
  toast('Szenario gelöscht.', 'Rückgängig', () => {
    state.notfall.splice(Math.min(idx, state.notfall.length), 0, item);
    rerender();
  });
}

/* ============================================================
   Export / Import / Reset
   ============================================================ */
function slugify(s) {
  return String(s || '').trim().replace(/[^\w\sÄÖÜäöüß-]/g,'').replace(/\s+/g,'_').slice(0,60);
}
function fileBase() {
  const name = slugify(state.meta.veranstaltung) || 'Veranstaltung';
  const stand = slugify(state.meta.stand) || todayISO();
  return `Gefaehrdungsbeurteilung_${name}_${stand}`;
}
function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJSON() {
  download(JSON.stringify(state, null, 2), fileBase() + '.json', 'application/json');
}

/* CSV für Excel (Semikolon, UTF-8 mit BOM) */
function exportCSV() {
  const cell = v => {
    let s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;     // keine Formel-Ausführung in Excel
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const head = ['Bereich', 'Gefährdung', 'Schutzmaßnahme', 'E', 'S', 'Risiko', 'Risikostufe',
                'E (mit Maßnahme)', 'S (mit Maßnahme)', 'Restrisiko', 'Restrisikostufe',
                'Verantwortlich', 'Termin', 'Erledigt'];
  const rows = state.gefaehrdungen.map(g => [
    g.bereich, g.gefahr, g.massnahme, g.e, g.s, riskOf(g), riskLabel(riskOf(g)),
    g.re, g.rs, restOf(g), riskLabel(restOf(g)),
    g.verantwortlich, formatDate(g.termin), g.erledigt ? 'ja' : 'nein'
  ]);
  const csv = [head, ...rows].map(r => r.map(cell).join(';')).join('\r\n');
  download('\uFEFF' + csv, fileBase() + '.csv', 'text/csv;charset=utf-8');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
          !(Array.isArray(parsed.gefaehrdungen) || parsed.meta || parsed.concepts)) {
        throw new Error('Format');
      }
      const backup = state;
      state = mergeState(parsed);
      searchTerm = '';
      saveState();
      renderAll();
      toast('Import erfolgreich.', 'Rückgängig', () => { state = backup; saveState(); renderAll(); });
    } catch (e) {
      toast('Import fehlgeschlagen: keine gültige Datei dieses Tools.');
    }
  };
  reader.onerror = () => toast('Import fehlgeschlagen: Datei konnte nicht gelesen werden.');
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm('Wirklich alles zurücksetzen? Der gesamte Bearbeitungsstand wird gelöscht und der Standardkatalog wiederhergestellt.')) return;
  const backup = state;
  state = defaultState();
  searchTerm = '';
  saveState();
  renderAll();
  toast('Alles zurückgesetzt.', 'Rückgängig', () => { state = backup; saveState(); renderAll(); });
}

/* ============================================================
   Druck-Vorbereitung
   ============================================================ */
let detailsBeforePrint = null;

function preparePrint() {
  cleanupPrint();
  // Anleitung/Erklärbox aufklappen
  detailsBeforePrint = Array.from(document.querySelectorAll('.info-box')).map(d => [d, d.open]);
  detailsBeforePrint.forEach(([d]) => { d.open = true; });

  // Druckkopf füllen
  const m = state.meta;
  $('print-title').textContent =
    (m.veranstaltung ? m.veranstaltung + ' – ' : '') + 'Gefährdungsbeurteilung & Sicherheitskonzept';
  const parts = [];
  if (m.ort) parts.push('Ort: ' + m.ort);
  if (m.datum) parts.push('Datum: ' + m.datum);
  if (m.besucher) parts.push('Besucher: ' + m.besucher);
  if (m.ersteller) parts.push('Ersteller: ' + m.ersteller);
  if (m.stand) parts.push('Stand: ' + m.stand);
  if (filtersActive()) parts.push('Auszug – Filter aktiv');
  $('print-meta').textContent = parts.join(' · ');

  // Textfelder als Fließtext spiegeln, damit im Druck nichts abgeschnitten wird
  document.querySelectorAll('main textarea').forEach(t => {
    const d = document.createElement('div');
    d.className = 'print-text';
    d.textContent = t.value || '–';
    t.insertAdjacentElement('afterend', d);
  });
}

function cleanupPrint() {
  document.querySelectorAll('.print-text').forEach(d => d.remove());
  if (detailsBeforePrint) {
    detailsBeforePrint.forEach(([d, open]) => { d.open = open; });
    detailsBeforePrint = null;
  }
}

/* ============================================================
   Event-Bindung
   ============================================================ */
function bindEvents() {
  // Tabs (Klick + Pfeiltasten)
  const nav = document.querySelector('.app-nav');
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn) setActiveTab(btn.dataset.tab);
  });
  nav.addEventListener('keydown', e => {
    const i = TABS.indexOf(state.activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length];
    else if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length];
    else if (e.key === 'Home') next = TABS[0];
    else if (e.key === 'End') next = TABS[TABS.length - 1];
    if (!next) return;
    e.preventDefault();
    setActiveTab(next);
    const btn = nav.querySelector(`[data-tab="${next}"]`);
    btn.focus();
    btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  // Metadaten
  document.querySelector('.meta-bar').addEventListener('input', e => {
    const field = (e.target.id || '').replace('meta-', '');
    if (META_FIELDS.includes(field)) { state.meta[field] = e.target.value; saveState(); }
  });

  // Suche / Sortierung
  $('gef-search').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGefTable();
  });
  $('gef-sort').addEventListener('change', e => {
    state.sortBy = SORT_KEYS.includes(e.target.value) ? e.target.value : 'katalog';
    renderGefTable(); saveState();
  });

  // Filterchips (Bereich)
  $('filter-bar').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (btn) { state.filterBereich = btn.dataset.filter; renderFilterBar(); renderGefTable(); saveState(); }
  });

  // Filter zurücksetzen
  $('filter-info').addEventListener('click', e => {
    if (!e.target.closest('[data-action="clear-filters"]')) return;
    clearFilters(false);
    renderGefAll(); saveState();
  });

  // Dashboard-Kästen = Risiko-Filter (Toggle)
  $('dashboard').addEventListener('click', e => {
    const card = e.target.closest('[data-risk]');
    if (!card) return;
    const key = card.dataset.risk;
    state.filterRisk = (state.filterRisk === key) ? 'alle' : key;
    renderDashboard(); renderGefTable(); saveState();
  });

  // Risikomatrix: Zelle = Filter (Toggle), Modus Risiko/Restrisiko
  $('matrix').addEventListener('click', e => {
    const cell = e.target.closest('[data-cell]');
    if (!cell) return;
    state.filterCell = (state.filterCell === cell.dataset.cell) ? null : cell.dataset.cell;
    renderMatrix(); renderGefTable(); saveState();
  });
  $('matrix-mode').addEventListener('click', e => {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    state.matrixMode = btn.dataset.mode === 'rest' ? 'rest' : 'risk';
    renderMatrix();
    if (state.filterCell) renderGefTable();
    saveState();
  });

  // Zeile ergänzen / Katalog wiederherstellen
  $('btn-add-row').addEventListener('click', addGefRow);
  $('btn-restore').addEventListener('click', restoreKatalog);

  // Gefährdungstabelle – change (Selects, Checkbox)
  const tbody = $('gef-tbody');
  tbody.addEventListener('change', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    const field = e.target.dataset.field;
    if (['e','s','re','rs'].includes(field)) {
      g[field] = clamp14(e.target.value, 1);
      g.vorschlag = false;            // Wert geändert -> kein Vorschlag mehr
      updateRowMeta(tr, g);           // Zeile bleibt stehen, Fokus bleibt erhalten
      renderDashboard(); renderMatrix(); renderMassnahmen(); saveState();
    } else if (field === 'bereich') {
      g.bereich = e.target.value;
      renderFilterBar(); saveState();
    } else if (field === 'erledigt') {
      g.erledigt = e.target.checked;
      tr.classList.toggle('is-done', g.erledigt);
      renderDashboard(); renderMassnahmen(); renderBadges(); saveState();
    }
  });
  // Gefährdungstabelle – input (Textfelder, ohne Re-Render für Fokuserhalt)
  tbody.addEventListener('input', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    const field = e.target.dataset.field;
    if (['gefahr','massnahme','verantwortlich'].includes(field)) {
      g[field] = e.target.value;
      saveState();
    }
  });
  // Gefährdungstabelle – Löschen
  tbody.addEventListener('click', e => {
    const del = e.target.closest('[data-action="del"]');
    if (del) { const tr = del.closest('tr'); if (tr) deleteGefRow(tr.dataset.id); }
  });

  // Maßnahmenplan
  const massTbody = $('mass-tbody');
  massTbody.addEventListener('input', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    if (e.target.dataset.field === 'verantwortlich') {
      g.verantwortlich = e.target.value;
      const inp = document.querySelector(`#gef-tbody tr[data-id="${cssEscape(g.id)}"] input[data-field="verantwortlich"]`);
      if (inp) inp.value = g.verantwortlich;
      saveState();
    }
  });
  massTbody.addEventListener('change', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    const field = e.target.dataset.field;
    if (field === 'erledigt') {
      g.erledigt = e.target.checked;
      const gefTr = document.querySelector(`#gef-tbody tr[data-id="${cssEscape(g.id)}"]`);
      if (gefTr) {
        gefTr.classList.toggle('is-done', g.erledigt);
        gefTr.querySelector('.done-check').checked = g.erledigt;
      }
      renderDashboard(); renderMassnahmen(); renderBadges(); saveState();
    } else if (field === 'termin') {
      g.termin = /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) ? e.target.value : '';
      e.target.classList.toggle('is-empty', !g.termin);
      tr.classList.toggle('is-overdue', isOverdue(g));
      saveState();
    }
  });
  $('chk-offene').addEventListener('change', e => {
    state.nurOffene = e.target.checked;
    renderMassnahmen(); saveState();
  });
  $('btn-csv').addEventListener('click', exportCSV);

  // Konzept-Formulare + automatische Höhe aller Textfelder
  document.querySelector('main').addEventListener('input', e => {
    if (e.target.tagName === 'TEXTAREA') autosizeOne(e.target);
    const form = e.target.dataset.form;
    if (form && state.concepts[form]) {
      state.concepts[form][e.target.dataset.field] = e.target.value;
      renderBadges();
      saveState();
    }
  });

  // Notfallkarten
  $('btn-add-notfall').addEventListener('click', addNotfall);
  const nfGrid = $('notfall-grid');
  nfGrid.addEventListener('input', e => {
    const card = e.target.closest('.nf-card'); if (!card) return;
    const n = state.notfall.find(x => x.id === card.dataset.id); if (!n) return;
    const field = e.target.dataset.field;
    if (field) { n[field] = e.target.value; saveState(); }
  });
  nfGrid.addEventListener('click', e => {
    const del = e.target.closest('[data-action="del-nf"]');
    if (del) { const card = del.closest('.nf-card'); if (card) deleteNotfall(card.dataset.id); }
  });

  // Kopf-Aktionen
  $('btn-print').addEventListener('click', () => window.print());
  $('btn-export').addEventListener('click', exportJSON);
  $('btn-import').addEventListener('click', () => $('file-import').click());
  $('file-import').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  $('btn-reset').addEventListener('click', resetAll);

  // Druck
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', cleanupPrint);

  // Textfeld-Höhen bei Größenänderung neu berechnen
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => autosize($('tab-' + state.activeTab)), 150);
  });
}

function cssEscape(s) { return String(s).replace(/["\\]/g, '\\$&'); }

/* ============================================================
   Init
   ============================================================ */
function init() {
  state = loadState();
  bindEvents();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
