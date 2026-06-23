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
  'Aufbau/Abbau', 'Höhen/Lasten', 'Technik/Elektro', 'Technik/Bühne',
  'Brandschutz', 'Flucht/Rettung', 'Personenströme', 'Zutritt/Sicherheit',
  'Beschäftigte', 'Catering/Hygiene', 'Außen/Witterung', 'Logistik/Verkehr',
  'Gefahrstoffe', 'Notfall/Gefahrenabwehr', 'Inklusion', 'Sonstige'
];

/* ------------------------------------------------------------
   Standardkatalog "Generisch"
   e/s = Risiko ohne Maßnahme, re/rs = Restrisiko mit Maßnahme
   ------------------------------------------------------------ */
const KATALOG_GENERISCH = [
  { id:'gen-1',  bereich:'Aufbau/Abbau', gefahr:'Absturz von Höhe (Rigging, Bühnenkante, Leiter)', massnahme:'T: Geländer/Absturzsicherung, Auffangnetze · O: Höhenarbeit nur durch befähigte Personen, Bereich absperren · P: PSAgA (Anschlagpunkte, Auffanggurt)', e:3, s:4, re:1, rs:4 },
  { id:'gen-2',  bereich:'Aufbau/Abbau', gefahr:'Sturz von Leitern/Tritten', massnahme:'S: Hubarbeitsbühne statt Leiter wo möglich · O: geprüfte Leitern, Standsicherheit, Unterweisung', e:3, s:2, re:2, rs:2 },
  { id:'gen-3',  bereich:'Aufbau/Abbau', gefahr:'Stolpern über Kabel/Material/Höhenunterschiede', massnahme:'T: Kabelbrücken/-kanäle, Abhängung · O: Wege freihalten, Markierung, ausreichende Beleuchtung', e:4, s:2, re:2, rs:2 },
  { id:'gen-4',  bereich:'Aufbau/Abbau', gefahr:'Schnitt-/Quetschverletzungen (Werkzeug, Cases)', massnahme:'O: Unterweisung, geeignetes Werkzeug · P: Schnittschutz-/Arbeitshandschuhe, Sicherheitsschuhe', e:3, s:2, re:2, rs:2 },

  { id:'gen-5',  bereich:'Höhen/Lasten', gefahr:'Herabfallende Lasten / hängende Traversen', massnahme:'T: Sekundärsicherung (Safeties), geprüfte Lastaufnahmemittel · O: Bereich unter Last sperren · P: Helm', e:2, s:4, re:1, rs:4 },
  { id:'gen-6',  bereich:'Höhen/Lasten', gefahr:'Versagen Anschlagmittel / Überlast Aufhängung', massnahme:'T: zugelassene Anschlagmittel mit Lastreserve · O: Prüfung durch Sachkundigen, Lastdokumentation', e:2, s:4, re:1, rs:4 },
  { id:'gen-7',  bereich:'Höhen/Lasten', gefahr:'Einsturz Bühne/Podest/Traverse', massnahme:'T: statischer Nachweis, geprüfte Systeme · O: Aufbau nach Herstellervorgabe, Abnahme vor Nutzung', e:1, s:4, re:1, rs:4 },

  { id:'gen-8',  bereich:'Technik/Elektro', gefahr:'Elektrische Gefährdung (Provisorien, Kabeltrassen)', massnahme:'T: RCD/FI-Schutz, geprüfte Betriebsmittel · O: Elektrofachkraft, DGUV-V3-Prüfung', e:3, s:3, re:1, rs:3 },
  { id:'gen-9',  bereich:'Technik/Elektro', gefahr:'Überlast / Kabelbrand Mehrfachverteiler', massnahme:'T: ausreichend dimensionierte Verteilung, Absicherung · O: Lastverteilung, keine Kaskadierung', e:2, s:3, re:1, rs:3 },
  { id:'gen-10', bereich:'Technik/Elektro', gefahr:'Bewegliche Bühnentechnik (Drehbühne, Hubpodien)', massnahme:'T: Quetschkantenschutz, Not-Aus · O: Bedienung nur durch eingewiesenes Personal, Bereich sichern', e:2, s:3, re:1, rs:3 },

  { id:'gen-11', bereich:'Brandschutz', gefahr:'Entstehungsbrand / Brandlast (Deko & Aufbauten)', massnahme:'S: schwerentflammbare Materialien (B1) · T: Brandlast reduzieren · O: B1-Nachweis, Brandwache', e:2, s:4, re:1, rs:4 },
  { id:'gen-12', bereich:'Brandschutz', gefahr:'Pyrotechnik / offene Flamme / Laser / Nebel', massnahme:'S: Verzicht/Alternative · O: Genehmigung, befähigte Person, Brandsicherheitswache, Abstände · T: Nebel mit BMA/ELA abstimmen', e:2, s:4, re:1, rs:3 },
  { id:'gen-13', bereich:'Brandschutz', gefahr:'Verstellte/abgeschaltete Brandschutzeinrichtungen (BMA, Hydranten)', massnahme:'O: Freihaltung BMA/Hydranten/Feuerlöscher, Kontrolle, keine BMA-Abschaltung ohne Ersatzmaßnahme', e:2, s:4, re:1, rs:4 },

  { id:'gen-14', bereich:'Flucht/Rettung', gefahr:'Verstellte/unzureichende Flucht- und Rettungswege', massnahme:'O: Fluchtwege/Notausgänge freihalten, regelmäßige Kontrolle, Bestuhlungsplan einhalten', e:3, s:4, re:1, rs:4 },
  { id:'gen-15', bereich:'Flucht/Rettung', gefahr:'Ausfall Sicherheits-/Notbeleuchtung/Kennzeichnung', massnahme:'T: Sicherheitsbeleuchtung mit Notstrom, geprüft · O: Funktionsprüfung vor Veranstaltung', e:2, s:3, re:1, rs:3 },
  { id:'gen-16', bereich:'Flucht/Rettung', gefahr:'Blockierte Feuerwehr-/Rettungszufahrten', massnahme:'O: Zufahrten/Aufstellflächen freihalten, Beschilderung, Abschleppregelung', e:2, s:4, re:1, rs:4 },

  { id:'gen-17', bereich:'Personenströme', gefahr:'Gedränge / Engstellen im Personenstrom', massnahme:'T: breitere Wegeführung, Leitsystem · O: Personenstromlenkung, Ordnungsdienst, Kapazitätssteuerung', e:3, s:3, re:2, rs:3 },
  { id:'gen-18', bereich:'Personenströme', gefahr:'Überschreitung zugelassener Personenzahl (gesamt)', massnahme:'O: Einlasszählung, genehmigte Höchstzahl, Einlassstopp · T: Zählsystem', e:2, s:4, re:1, rs:4 },
  { id:'gen-19', bereich:'Personenströme', gefahr:'Überfüllung einzelner Säle/Räume über genehmigte Zahl', massnahme:'O: saalbezogene Höchstzahl, Einlasszählung/-stopp, Personal an Saaltüren · T: Alternativräume/Streaming', e:3, s:4, re:1, rs:4 },
  { id:'gen-20', bereich:'Personenströme', gefahr:'Panik / unkontrollierte Massenbewegung', massnahme:'O: Personenstrommanagement, klare Durchsagen, geschultes Personal, Räumungskonzept · T: ELA', e:1, s:4, re:1, rs:4 },

  { id:'gen-21', bereich:'Beschäftigte', gefahr:'Lärm (Beschallung, Aufbau)', massnahme:'T: Lärmminderung, Abschirmung · O: Expositionszeiten begrenzen · P: Gehörschutz', e:3, s:2, re:2, rs:2 },
  { id:'gen-22', bereich:'Beschäftigte', gefahr:'Heben/Tragen schwerer Lasten', massnahme:'T: Hebe-/Transporthilfen · O: Unterweisung ergonomisches Heben, Teamarbeit', e:3, s:2, re:2, rs:2 },
  { id:'gen-23', bereich:'Beschäftigte', gefahr:'Psychische Belastung (Zeitdruck, Nacht-/Schichtarbeit)', massnahme:'O: realistische Zeitplanung, Pausen, Schichtgestaltung, ausreichend Personal', e:3, s:2, re:2, rs:2 },
  { id:'gen-24', bereich:'Beschäftigte', gefahr:'Hitze / Kälte / Zugluft', massnahme:'T: Heizung/Lüftung, Wetterschutz · O: Getränke, Pausen · P: witterungsgerechte Kleidung', e:3, s:2, re:2, rs:1 },

  { id:'gen-25', bereich:'Außen/Witterung', gefahr:'Witterung: Wind/Sturm/Last auf Zelten/Bühnen', massnahme:'S: Verzicht auf Außenaufbau · T: Ballastierung, Verankerung · O: Windlast-/Abbruchkriterien, Wettermonitoring', e:2, s:4, re:1, rs:4 },
  { id:'gen-26', bereich:'Außen/Witterung', gefahr:'Rutsch-/Sturzgefahr (Nässe, Schnee, Glätte)', massnahme:'T: rutschhemmende Beläge, Abstreifer · O: Räum-/Streudienst, Markierung', e:3, s:2, re:2, rs:2 },

  { id:'gen-27', bereich:'Logistik/Verkehr', gefahr:'Anfahren durch Stapler/Hubwagen', massnahme:'T: getrennte Verkehrs-/Fußwege · O: Verkehrsregelung, Einweiser · P: Warnkleidung', e:3, s:3, re:1, rs:3 },
  { id:'gen-28', bereich:'Logistik/Verkehr', gefahr:'Gefährdung in Ladezone / beim Rangieren', massnahme:'O: gesicherte Ladezone, Einweiser, Rückfahrwarnung · T: Abstützung/Ladungssicherung', e:2, s:3, re:1, rs:3 },

  { id:'gen-29', bereich:'Gefahrstoffe', gefahr:'Nebelfluid / Reinigungsmittel / Treibstoff', massnahme:'S: Ersatzstoffe · O: Sicherheitsdatenblätter, sichere Lagerung, Lüftung · P: ggf. Handschutz', e:2, s:2, re:1, rs:2 },

  { id:'gen-30', bereich:'Notfall/Gefahrenabwehr', gefahr:'Medizinischer Notfall / MANV', massnahme:'O: Sanitätsdienst vor Ort, Alarmierungskette, RTW-Zufahrt frei · T: AED bereitstellen', e:3, s:3, re:2, rs:3 },
  { id:'gen-31', bereich:'Notfall/Gefahrenabwehr', gefahr:'Stromausfall sicherheitsrelevanter Technik', massnahme:'T: Netzersatz/USV für sicherheitsrelevante Technik · O: Notfallplan, Durchsagekonzept', e:2, s:3, re:1, rs:3 },
  { id:'gen-32', bereich:'Notfall/Gefahrenabwehr', gefahr:'Bedrohung / Bombendrohung / unbefugter Zutritt', massnahme:'O: Zutritts-/Einlasskontrolle, Schulung, Notfallplan mit Polizei · T: Detektion/Absperrung', e:2, s:4, re:1, rs:4 }
];

/* ------------------------------------------------------------
   Standardkatalog "Kongress / Tagung"
   ------------------------------------------------------------ */
const KATALOG_KONGRESS = [
  { id:'kon-1',  bereich:'Zutritt/Sicherheit', gefahr:'Unbefugter Zutritt / Umgehung der Akkreditierung (B2G)', massnahme:'T: Akkreditierungssystem/Badges, Vereinzelung · O: Zutrittskontrolle, Ordnungsdienst, Zonenkonzept', e:3, s:3, re:1, rs:3 },
  { id:'kon-2',  bereich:'Zutritt/Sicherheit', gefahr:'Personenschutz exponierter Teilnehmer (Regierung)', massnahme:'O: Abstimmung mit Polizei/Personenschützern, gesicherte Zonen und Routen · T: bauliche Sicherung', e:2, s:4, re:1, rs:4 },
  { id:'kon-3',  bereich:'Zutritt/Sicherheit', gefahr:'Einbringen gefährlicher Gegenstände', massnahme:'O: Einlass-/Taschenkontrolle nach Hausrecht · T: Detektionstechnik', e:2, s:4, re:1, rs:4 },
  { id:'kon-4',  bereich:'Zutritt/Sicherheit', gefahr:'Protest / Demonstration / Aktionen', massnahme:'O: Lagebild, Abstimmung Polizei, Deeskalation, Eingänge/Zufahrten sichern', e:2, s:3, re:1, rs:3 },

  { id:'kon-5',  bereich:'Flucht/Rettung', gefahr:'Entfluchtung bestuhlter Säle (Reihen-/Blockbestuhlung)', massnahme:'T: Bestuhlungsplan nach Gangbreiten/Reihenabständen · O: Genehmigung, Räumungshelfer, Wege frei', e:2, s:4, re:1, rs:4 },
  { id:'kon-6',  bereich:'Inklusion', gefahr:'Mobilitätseingeschränkte Personen bei Räumung', massnahme:'O: Evakuierungshelfer, Sammelpunkte, Buddy-System · T: Evakuierungsstühle, barrierefreie Wege', e:2, s:4, re:1, rs:3 },
  { id:'kon-7',  bereich:'Flucht/Rettung', gefahr:'Räumung über mehrere Ebenen / Aufzüge im Brandfall', massnahme:'O: Räumungskonzept (Aufzüge nicht nutzen), Treppenraumlenkung, Räumungshelfer · T: ELA-Durchsagen', e:2, s:4, re:1, rs:4 },

  { id:'kon-8',  bereich:'Personenströme', gefahr:'Überfüllung einzelner Säle bei beliebten Keynotes', massnahme:'O: saalbezogene Höchstzahl, Einlasszählung/-stopp, Personal an Saaltüren · T: Alternativräume/Streaming', e:3, s:4, re:1, rs:4 },
  { id:'kon-9',  bereich:'Personenströme', gefahr:'Stau in Foyers bei Pausen / Sessionwechsel', massnahme:'O: entzerrte Pausen-/Sessionzeiten, Wegeführung · T: breite Verkehrsflächen, Leitsystem', e:3, s:2, re:2, rs:2 },
  { id:'kon-10', bereich:'Personenströme', gefahr:'Rückstau bei Einlass / Registrierung', massnahme:'T: ausreichend Einlassspuren/Scanner · O: Zeitfenster-Einlass, Wartezonen, Personal', e:3, s:2, re:2, rs:1 },
  { id:'kon-11', bereich:'Personenströme', gefahr:'Andrang an Garderobe / Catering-Ausgabe', massnahme:'T: dezentrale Ausgaben, ausreichende Kapazität · O: Personalsteuerung, Wegeführung', e:3, s:1, re:2, rs:1 },

  { id:'kon-12', bereich:'Brandschutz', gefahr:'Brandlast Messestände / Ausstellung im Foyer', massnahme:'S: B1-Materialien · O: B1-Nachweis Standbau, Standabnahme, Brandwache · T: Wege freihalten', e:2, s:4, re:1, rs:4 },
  { id:'kon-13', bereich:'Brandschutz', gefahr:'Dekobeleuchtung / Kerzen / Heizstrahler (Abendevent)', massnahme:'S: LED statt offener Flamme · O: Abstände, Brandwache · T: standsichere Heizstrahler mit Abstand', e:2, s:3, re:1, rs:3 },

  { id:'kon-14', bereich:'Technik/Bühne', gefahr:'Bühne/Medientechnik/Rigging über Publikum', massnahme:'T: Sekundärsicherung, statischer Nachweis · O: geprüfte Lasten, Sperrbereiche bei Montage', e:2, s:4, re:1, rs:4 },
  { id:'kon-15', bereich:'Technik/Bühne', gefahr:'Ausfall Dolmetsch-/Medientechnik (internat. Kongress)', massnahme:'T: Redundanz, Ersatzgeräte · O: Technik-Standby, Notfallablauf', e:2, s:2, re:1, rs:2 },
  { id:'kon-16', bereich:'Technik/Bühne', gefahr:'Sturz von Podest/Rednerbühne (auch Teilnehmer)', massnahme:'T: Geländer/Kantenmarkierung, rutschhemmend · O: Beleuchtung, Einweisung', e:2, s:3, re:1, rs:3 },

  { id:'kon-17', bereich:'Catering/Hygiene', gefahr:'Catering: Rutschgefahr / Allergene / Hygiene', massnahme:'O: HACCP, Allergenkennzeichnung, Reinigung · T: rutschhemmende Beläge', e:3, s:2, re:2, rs:2 },
  { id:'kon-18', bereich:'Catering/Hygiene', gefahr:'Lebensmittelvergiftung / Kühlkettenunterbrechung', massnahme:'O: HACCP, Kühlkettenkontrolle, Rückstellproben, zertifizierter Caterer', e:1, s:3, re:1, rs:3 },
  { id:'kon-19', bereich:'Catering/Hygiene', gefahr:'Alkoholbedingte Vorfälle', massnahme:'O: Ausschankregeln, kein Ausschank an erkennbar Betrunkene, Ordnungsdienst, alkoholfreie Alternativen', e:2, s:2, re:1, rs:2 },

  { id:'kon-20', bereich:'Beschäftigte', gefahr:'Belastung Stand-/Servicepersonal (Stehen, Lärm, Stress)', massnahme:'O: Pausen, Schichtwechsel, Sitzgelegenheiten · T: Lärmminderung', e:3, s:1, re:2, rs:1 },

  { id:'kon-21', bereich:'Notfall/Gefahrenabwehr', gefahr:'Unzureichende Alarmierung / Räumungsdurchsage', massnahme:'T: ELA/Sprachalarmierung flächendeckend, geprüft · O: vorbereitete, mehrsprachige Durchsagetexte', e:2, s:4, re:1, rs:4 },
  { id:'kon-22', bereich:'Notfall/Gefahrenabwehr', gefahr:'Medizinischer Notfall (älteres Fachpublikum)', massnahme:'O: Sanitätsdienst, AED-Standorte, Alarmierungskette · T: AED bereitstellen', e:3, s:3, re:2, rs:3 },
  { id:'kon-23', bereich:'Notfall/Gefahrenabwehr', gefahr:'Stromausfall während einer Session', massnahme:'T: USV/Netzersatz für sicherheitsrelevante Technik · O: Notfalldurchsage, Programmunterbrechung', e:2, s:3, re:1, rs:3 },
  { id:'kon-24', bereich:'Notfall/Gefahrenabwehr', gefahr:'Ausfall Ticketing/IT/WLAN mit Stau-/Sicherheitsfolge', massnahme:'T: Redundanz, Offline-Fallback · O: manuelle Einlassprozesse, Kommunikationsplan', e:2, s:2, re:1, rs:2 }
];

const KATALOGE = { generisch: KATALOG_GENERISCH, kongress: KATALOG_KONGRESS };

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
let state = null;

function defaultState() {
  return {
    version: 1,
    meta: { veranstaltung:'', ort:'', datum:'', besucher:'', ersteller:'', stand:'' },
    activeCatalog: 'generisch',
    loadedCatalogs: ['generisch'],
    activeTab: 'gefaehrdung',
    filterBereich: 'alle',
    gefaehrdungen: KATALOG_GENERISCH.map(toGefItem),
    concepts: { ordnungsdienst:{}, sanitaetsdienst:{}, brandschutz:{} },
    notfall: NOTFALL_DEFAULT.map(n => ({ ...n }))
  };
}

/* Katalogeintrag -> Arbeitsobjekt */
function toGefItem(c) {
  return {
    id: c.id, catalog: c.id.startsWith('kon-') ? 'kongress' : 'generisch',
    bereich: c.bereich, gefahr: c.gefahr, massnahme: c.massnahme,
    e: c.e, s: c.s, re: c.re, rs: c.rs,
    verantwortlich: '', erledigt: false, vorschlag: true
  };
}

/* ============================================================
   Persistenz
   ============================================================ */
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Speichern fehlgeschlagen', e); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return mergeState(parsed);
  } catch (e) {
    console.warn('Laden fehlgeschlagen, Standard wird verwendet', e);
    return defaultState();
  }
}

/* defensiv: fehlende Felder ergänzen */
function mergeState(p) {
  const d = defaultState();
  return {
    version: 1,
    meta: Object.assign(d.meta, p.meta || {}),
    activeCatalog: p.activeCatalog || 'generisch',
    loadedCatalogs: Array.isArray(p.loadedCatalogs) && p.loadedCatalogs.length ? p.loadedCatalogs : ['generisch'],
    activeTab: p.activeTab || 'gefaehrdung',
    filterBereich: p.filterBereich || 'alle',
    gefaehrdungen: Array.isArray(p.gefaehrdungen) ? p.gefaehrdungen : d.gefaehrdungen,
    concepts: Object.assign({ ordnungsdienst:{}, sanitaetsdienst:{}, brandschutz:{} }, p.concepts || {}),
    notfall: Array.isArray(p.notfall) ? p.notfall : d.notfall
  };
}

/* ============================================================
   Hilfsfunktionen
   ============================================================ */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function riskClass(v) {
  if (v <= 3) return 'r-green';
  if (v <= 6) return 'r-yellow';
  if (v <= 9) return 'r-orange';
  return 'r-red';
}
function riskLabel(v) {
  if (v <= 3) return 'gering';
  if (v <= 6) return 'mittel';
  if (v <= 9) return 'hoch';
  return 'sehr hoch';
}

/* sichtbare Gefährdungen = aktiver Katalog + eigene Einträge */
function visibleGef() {
  return state.gefaehrdungen.filter(g => g.catalog === state.activeCatalog || g.catalog === 'custom');
}

/* ============================================================
   Rendering: Gefährdungstabelle
   ============================================================ */
const optionList16 = [1,2,3,4];

function selectOptions(selected) {
  return optionList16.map(n => `<option value="${n}"${n===selected?' selected':''}>${n}</option>`).join('');
}

function bereichOptions(selected) {
  return KATEGORIEN.map(k => `<option value="${esc(k)}"${k===selected?' selected':''}>${esc(k)}</option>`).join('');
}

function renderGefTable() {
  const tbody = document.getElementById('gef-tbody');
  let list = visibleGef();
  if (state.filterBereich !== 'alle') list = list.filter(g => g.bereich === state.filterBereich);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:18px;">Keine Einträge in diesem Filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(g => {
    const risk = g.e * g.s;
    const rest = g.re * g.rs;
    return `<tr data-id="${esc(g.id)}">
      <td class="col-bereich"><select class="cell-select" data-field="bereich" aria-label="Bereich">${bereichOptions(g.bereich)}</select></td>
      <td><textarea class="cell-input" data-field="gefahr" rows="2" aria-label="Gefährdung">${esc(g.gefahr)}</textarea></td>
      <td><textarea class="cell-input" data-field="massnahme" rows="2" aria-label="Schutzmaßnahme">${esc(g.massnahme)}</textarea></td>
      <td class="risk-cell">
        <div class="risk-selects">
          <select data-field="e" aria-label="Eintrittswahrscheinlichkeit">${selectOptions(g.e)}</select>
          <span class="mul">×</span>
          <select data-field="s" aria-label="Schwere">${selectOptions(g.s)}</select>
        </div>
        <span class="risk-badge ${riskClass(risk)}" title="${riskLabel(risk)}">${risk}</span>
        ${g.vorschlag ? '<span class="vorschlag-tag">Vorschlag</span>' : ''}
      </td>
      <td class="risk-cell">
        <div class="risk-selects">
          <select data-field="re" aria-label="Rest-Eintrittswahrscheinlichkeit">${selectOptions(g.re)}</select>
          <span class="mul">×</span>
          <select data-field="rs" aria-label="Rest-Schwere">${selectOptions(g.rs)}</select>
        </div>
        <span class="risk-badge ${riskClass(rest)}" title="${riskLabel(rest)}">${rest}</span>
      </td>
      <td class="col-verant"><input class="cell-input is-text" type="text" data-field="verantwortlich" value="${esc(g.verantwortlich)}" aria-label="Verantwortlich"></td>
      <td class="col-done"><input class="done-check" type="checkbox" data-field="erledigt" ${g.erledigt?'checked':''} aria-label="erledigt"></td>
      <td class="col-act no-print"><button type="button" class="row-del" data-action="del" title="Zeile löschen" aria-label="Zeile löschen">×</button></td>
    </tr>`;
  }).join('');
}

/* ============================================================
   Rendering: Filterchips
   ============================================================ */
function renderFilterBar() {
  const bar = document.getElementById('filter-bar');
  const list = visibleGef();
  const counts = {};
  list.forEach(g => { counts[g.bereich] = (counts[g.bereich]||0)+1; });

  let html = `<button type="button" class="chip${state.filterBereich==='alle'?' is-active':''}" data-filter="alle">Alle<span class="chip-count">${list.length}</span></button>`;
  // feste Reihenfolge, nur vorkommende Kategorien
  KATEGORIEN.forEach(k => {
    if (counts[k]) {
      html += `<button type="button" class="chip${state.filterBereich===k?' is-active':''}" data-filter="${esc(k)}">${esc(k)}<span class="chip-count">${counts[k]}</span></button>`;
    }
  });
  bar.innerHTML = html;
}

/* ============================================================
   Rendering: Dashboard
   ============================================================ */
function renderDashboard() {
  const dash = document.getElementById('dashboard');
  const list = visibleGef();
  let green=0, yellow=0, orange=0, red=0, offen=0;
  list.forEach(g => {
    const r = g.e * g.s;
    if (r <= 3) green++; else if (r <= 6) yellow++; else if (r <= 9) orange++; else red++;
    if (r >= 7 && !g.erledigt) offen++;
  });
  dash.innerHTML = `
    <div class="dash-card is-green"><div class="dash-num">${green}</div><div class="dash-label">gering (1–3)</div></div>
    <div class="dash-card is-yellow"><div class="dash-num">${yellow}</div><div class="dash-label">mittel (4–6)</div></div>
    <div class="dash-card is-orange"><div class="dash-num">${orange}</div><div class="dash-label">hoch (7–9)</div></div>
    <div class="dash-card is-red"><div class="dash-num">${red}</div><div class="dash-label">sehr hoch (10–16)</div></div>
    <div class="dash-card is-open"><div class="dash-num">${offen}</div><div class="dash-label">offene Maßnahmen (Risiko ≥ 7, nicht erledigt)</div></div>`;
}

/* ============================================================
   Rendering: Risikomatrix 4x4
   ============================================================ */
function renderMatrix() {
  const wrap = document.getElementById('matrix');
  let html = '<table class="matrix"><caption>Zeilen = Schwere (S), Spalten = Eintrittswahrscheinlichkeit (E). Zahl = E × S.</caption>';
  html += '<tr><th class="axis-label">S \\ E</th>';
  for (let e=1; e<=4; e++) html += `<th>${e}</th>`;
  html += '</tr>';
  for (let s=4; s>=1; s--) {
    html += `<tr><th>${s}</th>`;
    for (let e=1; e<=4; e++) {
      const v = e*s;
      html += `<td class="${riskClass(v)}"><b>${v}</b></td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  wrap.innerHTML = html;
}

/* ============================================================
   Rendering: Maßnahmenplan
   ============================================================ */
function renderMassnahmen() {
  const tbody = document.getElementById('mass-tbody');
  const list = visibleGef().slice().sort((a,b) => (b.re*b.rs) - (a.re*a.rs));
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:18px;">Keine Maßnahmen vorhanden.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(g => {
    const rest = g.re * g.rs;
    return `<tr data-id="${esc(g.id)}">
      <td>${esc(g.gefahr)}</td>
      <td>${esc(g.massnahme)}</td>
      <td class="risk-cell"><span class="risk-badge ${riskClass(rest)}">${rest}</span></td>
      <td class="col-verant"><input class="cell-input is-text" type="text" data-field="verantwortlich" value="${esc(g.verantwortlich)}" aria-label="Verantwortlich"></td>
      <td class="col-done"><input class="done-check" type="checkbox" data-field="erledigt" ${g.erledigt?'checked':''} aria-label="erledigt"></td>
    </tr>`;
  }).join('');
}

/* ============================================================
   Rendering: Konzept-Formulare
   ============================================================ */
function renderForms() {
  Object.keys(FORM_DEFS).forEach(key => {
    const container = document.getElementById('form-' + key);
    if (!container) return;
    const data = state.concepts[key] || {};
    container.innerHTML = FORM_DEFS[key].map(([field, label, placeholder]) =>
      `<div class="form-field">
        <label for="f-${key}-${field}">${esc(label)}</label>
        <textarea id="f-${key}-${field}" data-form="${key}" data-field="${field}" placeholder="${esc(placeholder)}">${esc(data[field]||'')}</textarea>
      </div>`).join('');
  });
}

/* ============================================================
   Rendering: Notfallkarten
   ============================================================ */
function renderNotfall() {
  const grid = document.getElementById('notfall-grid');
  grid.innerHTML = state.notfall.map(n =>
    `<div class="nf-card" data-id="${esc(n.id)}">
      <div class="nf-card__head">
        <input type="text" data-field="titel" value="${esc(n.titel)}" aria-label="Titel">
        <button type="button" class="row-del no-print" data-action="del-nf" title="Szenario löschen" aria-label="Szenario löschen">×</button>
      </div>
      <div class="nf-field"><label>Auslöser</label><textarea data-field="ausloeser">${esc(n.ausloeser)}</textarea></div>
      <div class="nf-field"><label>Sofortmaßnahmen</label><textarea data-field="sofort">${esc(n.sofort)}</textarea></div>
      <div class="nf-field"><label>Verantwortlich</label><textarea data-field="verantwortlich">${esc(n.verantwortlich)}</textarea></div>
      <div class="nf-field"><label>Eskalation</label><textarea data-field="eskalation">${esc(n.eskalation)}</textarea></div>
    </div>`).join('');
}

/* ============================================================
   Rendering: Metadaten / Katalog-Buttons
   ============================================================ */
function renderMeta() {
  document.getElementById('meta-veranstaltung').value = state.meta.veranstaltung;
  document.getElementById('meta-ort').value = state.meta.ort;
  document.getElementById('meta-datum').value = state.meta.datum;
  document.getElementById('meta-besucher').value = state.meta.besucher;
  document.getElementById('meta-ersteller').value = state.meta.ersteller;
  document.getElementById('meta-stand').value = state.meta.stand;
}

function renderCatalogButtons() {
  document.querySelectorAll('.catalog-btn').forEach(b => {
    b.classList.toggle('is-active', b.dataset.catalog === state.activeCatalog);
  });
}

/* zentraler Re-Render der Gefährdungs-relevanten Teile */
function renderGefAll() {
  renderFilterBar();
  renderDashboard();
  renderGefTable();
  renderMassnahmen();
}

function renderAll() {
  renderMeta();
  renderCatalogButtons();
  renderGefAll();
  renderMatrix();
  renderForms();
  renderNotfall();
  setActiveTab(state.activeTab, false);
}

/* ============================================================
   Tabs
   ============================================================ */
function setActiveTab(tab, save=true) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    const on = b.dataset.tab === tab;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.tab-section').forEach(s => {
    s.classList.toggle('is-active', s.id === 'tab-' + tab);
  });
  if (save) saveState();
}

/* ============================================================
   Mutationen
   ============================================================ */
function findGef(id) { return state.gefaehrdungen.find(g => g.id === id); }

function ensureCatalogLoaded(key) {
  if (state.loadedCatalogs.includes(key)) return;
  const items = (KATALOGE[key] || []).map(toGefItem);
  state.gefaehrdungen = state.gefaehrdungen.concat(items);
  state.loadedCatalogs.push(key);
}

function switchCatalog(key) {
  if (!KATALOGE[key]) return;
  ensureCatalogLoaded(key);
  state.activeCatalog = key;
  state.filterBereich = 'alle';
  renderCatalogButtons();
  renderGefAll();
  saveState();
}

function addGefRow() {
  const item = {
    id: uid('c-'), catalog: 'custom', bereich: 'Sonstige',
    gefahr: '', massnahme: '', e: 1, s: 1, re: 1, rs: 1,
    verantwortlich: '', erledigt: false, vorschlag: false
  };
  state.gefaehrdungen.push(item);
  renderGefAll();
  saveState();
}

function deleteGefRow(id) {
  state.gefaehrdungen = state.gefaehrdungen.filter(g => g.id !== id);
  renderGefAll();
  saveState();
}

function addNotfall() {
  state.notfall.push({ id: uid('nf-'), titel:'Neues Szenario', ausloeser:'', sofort:'', verantwortlich:'', eskalation:'' });
  renderNotfall();
  saveState();
}

function deleteNotfall(id) {
  state.notfall = state.notfall.filter(n => n.id !== id);
  renderNotfall();
  saveState();
}

/* ============================================================
   Export / Import / Reset
   ============================================================ */
function slugify(str) {
  return String(str || '').trim().replace(/[^\w\sÄÖÜäöüß-]/g,'').replace(/\s+/g,'_').slice(0,60) || 'Veranstaltung';
}

function exportJSON() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = slugify(state.meta.veranstaltung);
  const stand = slugify(state.meta.stand) || new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `Gefaehrdungsbeurteilung_${name}_${stand}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = mergeState(parsed);
      saveState();
      renderAll();
      alert('Import erfolgreich.');
    } catch (e) {
      alert('Import fehlgeschlagen: Die Datei ist kein gültiges JSON dieses Tools.');
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm('Wirklich alles zurücksetzen? Der gesamte Bearbeitungsstand wird gelöscht und der Standardkatalog wiederhergestellt.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  saveState();
  renderAll();
}

/* ============================================================
   Druck-Vorbereitung
   ============================================================ */
function preparePrint() {
  // Anleitung/Erklärbox aufklappen
  document.querySelectorAll('.info-box').forEach(d => d.open = true);
  // Druckkopf füllen
  const m = state.meta;
  document.getElementById('print-title').textContent =
    (m.veranstaltung ? m.veranstaltung + ' – ' : '') + 'Gefährdungsbeurteilung & Sicherheitskonzept';
  const parts = [];
  if (m.ort) parts.push('Ort: ' + m.ort);
  if (m.datum) parts.push('Datum: ' + m.datum);
  if (m.besucher) parts.push('Besucher: ' + m.besucher);
  if (m.ersteller) parts.push('Ersteller: ' + m.ersteller);
  if (m.stand) parts.push('Stand: ' + m.stand);
  document.getElementById('print-meta').textContent = parts.join(' · ');
}

/* ============================================================
   Event-Bindung
   ============================================================ */
function bindEvents() {
  // Tabs
  document.querySelector('.app-nav').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn) setActiveTab(btn.dataset.tab);
  });

  // Metadaten
  document.querySelector('.meta-bar').addEventListener('input', e => {
    const map = {
      'meta-veranstaltung':'veranstaltung','meta-ort':'ort','meta-datum':'datum',
      'meta-besucher':'besucher','meta-ersteller':'ersteller','meta-stand':'stand'
    };
    const field = map[e.target.id];
    if (field) { state.meta[field] = e.target.value; saveState(); }
  });

  // Katalog-Umschaltung
  document.querySelector('.catalog-switch').addEventListener('click', e => {
    const btn = e.target.closest('.catalog-btn');
    if (btn) switchCatalog(btn.dataset.catalog);
  });

  // Filterchips
  document.getElementById('filter-bar').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (btn) { state.filterBereich = btn.dataset.filter; renderFilterBar(); renderGefTable(); saveState(); }
  });

  // Zeile ergänzen
  document.getElementById('btn-add-row').addEventListener('click', addGefRow);

  // Gefährdungstabelle – change (Selects, Checkbox, Delete)
  const tbody = document.getElementById('gef-tbody');
  tbody.addEventListener('change', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    const field = e.target.dataset.field;
    if (['e','s','re','rs'].includes(field)) {
      g[field] = parseInt(e.target.value, 10);
      g.vorschlag = false;            // Wert geändert -> kein Vorschlag mehr
      renderDashboard(); renderGefTable(); renderMassnahmen(); saveState();
    } else if (field === 'bereich') {
      g.bereich = e.target.value;
      renderFilterBar(); renderGefTable(); saveState();
    } else if (field === 'erledigt') {
      g.erledigt = e.target.checked;
      renderDashboard(); renderMassnahmen(); saveState();
    }
  });
  // Gefährdungstabelle – input (Textfelder, ohne Re-Render für Fokuserhalt)
  tbody.addEventListener('input', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    const field = e.target.dataset.field;
    if (['gefahr','massnahme','verantwortlich'].includes(field)) {
      g[field] = e.target.value;
      if (field === 'verantwortlich') syncMassVerantwortlich(g.id, g.verantwortlich);
      saveState();
    }
  });
  // Gefährdungstabelle – Löschen
  tbody.addEventListener('click', e => {
    const del = e.target.closest('[data-action="del"]');
    if (del) { const tr = del.closest('tr'); if (tr) deleteGefRow(tr.dataset.id); }
  });

  // Maßnahmenplan – Sync zurück
  const massTbody = document.getElementById('mass-tbody');
  massTbody.addEventListener('input', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    if (e.target.dataset.field === 'verantwortlich') {
      g.verantwortlich = e.target.value;
      syncGefVerantwortlich(g.id, g.verantwortlich);
      saveState();
    }
  });
  massTbody.addEventListener('change', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const g = findGef(tr.dataset.id); if (!g) return;
    if (e.target.dataset.field === 'erledigt') {
      g.erledigt = e.target.checked;
      renderDashboard(); renderGefTable(); saveState();
    }
  });

  // Konzept-Formulare
  document.querySelector('main').addEventListener('input', e => {
    const form = e.target.dataset.form;
    if (form && state.concepts[form]) {
      state.concepts[form][e.target.dataset.field] = e.target.value;
      saveState();
    }
  });

  // Notfallkarten
  document.getElementById('btn-add-notfall').addEventListener('click', addNotfall);
  const nfGrid = document.getElementById('notfall-grid');
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
  document.getElementById('btn-print').addEventListener('click', () => window.print());
  document.getElementById('btn-export').addEventListener('click', exportJSON);
  document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
  document.getElementById('file-import').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btn-reset').addEventListener('click', resetAll);

  // Druck
  window.addEventListener('beforeprint', preparePrint);
}

/* Verantwortlich zwischen Tabelle und Plan synchron halten (ohne Re-Render des aktiven Felds) */
function syncMassVerantwortlich(id, val) {
  const inp = document.querySelector(`#mass-tbody tr[data-id="${cssEscape(id)}"] input[data-field="verantwortlich"]`);
  if (inp && inp.value !== val) inp.value = val;
}
function syncGefVerantwortlich(id, val) {
  const inp = document.querySelector(`#gef-tbody tr[data-id="${cssEscape(id)}"] input[data-field="verantwortlich"]`);
  if (inp && inp.value !== val) inp.value = val;
}
function cssEscape(s) { return String(s).replace(/["\\]/g,'\\$&'); }

/* ============================================================
   Init
   ============================================================ */
function init() {
  state = loadState();
  bindEvents();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
