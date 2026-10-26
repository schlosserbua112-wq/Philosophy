-- Startkatalog: Denkschulen mit geprüften Sach- und Romanvorschlägen sowie kuratierte Fragen.
-- Claude wählt Buchempfehlungen ausschließlich aus dieser Liste, damit keine Titel erfunden werden.

insert into public.schools (slug, name, summary, thinkers) values
('stoizismus', 'Stoizismus', 'Unterscheide, was in deiner Macht steht und was nicht. Gelassenheit entsteht durch Urteil und Tugend, nicht durch äußere Umstände.', array['Seneca','Epiktet','Marc Aurel']),
('existenzialismus', 'Existenzialismus', 'Die Existenz geht der Essenz voraus: Der Mensch ist zur Freiheit verurteilt und erschafft sich durch seine Entscheidungen selbst.', array['Jean-Paul Sartre','Simone de Beauvoir','Søren Kierkegaard']),
('absurdismus', 'Absurdismus', 'Der Mensch sucht Sinn in einer Welt, die schweigt. Die Antwort ist weder Flucht noch Verzweiflung, sondern Auflehnung und gelebte Intensität.', array['Albert Camus']),
('utilitarismus', 'Utilitarismus', 'Richtig ist, was das größte Wohl für die größte Zahl bewirkt. Moral ist eine Frage der Folgen.', array['Jeremy Bentham','John Stuart Mill','Peter Singer']),
('pflichtethik', 'Kantische Pflichtethik', 'Handle nur nach der Maxime, von der du wollen kannst, dass sie allgemeines Gesetz werde. Menschen sind nie bloß Mittel.', array['Immanuel Kant']),
('tugendethik', 'Tugendethik', 'Nicht einzelne Handlungen, sondern der Charakter zählt. Ein gutes Leben heißt, Tugenden durch Übung zu entwickeln.', array['Aristoteles','Alasdair MacIntyre','Martha Nussbaum']),
('empirismus', 'Empirismus und Skepsis', 'Alles Wissen stammt aus Erfahrung. Das Ich ist kein fester Kern, sondern ein Bündel von Wahrnehmungen.', array['John Locke','David Hume']),
('rationalismus', 'Rationalismus', 'Die Vernunft ist die sicherste Quelle der Erkenntnis. Manche Wahrheiten erkennen wir unabhängig von der Erfahrung.', array['René Descartes','Baruch de Spinoza','Gottfried Wilhelm Leibniz']),
('buddhismus', 'Buddhistische Philosophie', 'Leid entsteht aus Anhaften. Es gibt kein unveränderliches Selbst, alles ist vergänglich und bedingt entstanden.', array['Siddhartha Gautama','Nagarjuna']),
('daoismus', 'Daoismus', 'Folge dem Dao, dem natürlichen Lauf der Dinge. Handeln durch Nicht-Eingreifen (Wu Wei) statt durch Zwang.', array['Laozi','Zhuangzi']),
('nietzsche', 'Nietzsches Perspektivismus', 'Es gibt keine Tatsachen, nur Interpretationen. Werte sind menschgemacht und müssen neu geschaffen werden.', array['Friedrich Nietzsche']),
('pragmatismus', 'Pragmatismus', 'Wahr ist, was sich im Handeln bewährt. Ideen sind Werkzeuge, keine Abbilder einer ewigen Wahrheit.', array['William James','John Dewey','Richard Rorty']),
('kompatibilismus', 'Kompatibilismus', 'Freiheit und Determinismus schließen sich nicht aus. Frei ist, wer nach eigenen, reflektierten Gründen handelt.', array['David Hume','Daniel Dennett','Peter Bieri']),
('kritische_theorie', 'Kritische Theorie', 'Gesellschaftliche Verhältnisse prägen unser Denken. Philosophie soll Herrschaft durchschauen und Emanzipation ermöglichen.', array['Karl Marx','Theodor W. Adorno','Erich Fromm']),
('platonismus', 'Platonismus', 'Hinter der sichtbaren Welt liegen ewige Ideen. Erkenntnis ist Erinnerung und Aufstieg aus der Höhle.', array['Platon','Sokrates'])
on conflict (slug) do nothing;

insert into public.books (school_slug, title, author, kind, blurb) values
('stoizismus', 'Selbstbetrachtungen', 'Marc Aurel', 'sachbuch', 'Private Notizen eines römischen Kaisers über Pflicht, Vergänglichkeit und innere Ruhe.'),
('stoizismus', 'Briefe an Lucilius', 'Seneca', 'sachbuch', 'Lebensnahe Briefe über Zeit, Freundschaft, Tod und Gelassenheit.'),
('stoizismus', 'Ein ganzer Kerl', 'Tom Wolfe', 'roman', 'Ein Häftling entdeckt Epiktet und findet im Gefängnis eine stoische Freiheit.'),
('stoizismus', 'Der alte Mann und das Meer', 'Ernest Hemingway', 'roman', 'Würde und Ausdauer im Angesicht eines Kampfes, den man nicht gewinnen kann.'),

('existenzialismus', 'Der Existentialismus ist ein Humanismus', 'Jean-Paul Sartre', 'sachbuch', 'Sartres kurzer, zugänglicher Vortrag über Freiheit und Verantwortung.'),
('existenzialismus', 'Das Café der Existenzialisten', 'Sarah Bakewell', 'sachbuch', 'Lebendige Geschichte der Existenzialisten und ihrer Ideen.'),
('existenzialismus', 'Der Ekel', 'Jean-Paul Sartre', 'roman', 'Antoine Roquentin entdeckt die nackte, grundlose Existenz der Dinge.'),
('existenzialismus', 'Die Mandarins von Paris', 'Simone de Beauvoir', 'roman', 'Intellektuelle ringen nach dem Krieg um Engagement und Freiheit.'),

('absurdismus', 'Der Mythos des Sisyphos', 'Albert Camus', 'sachbuch', 'Camus'' Essay über das Absurde und die Frage, warum man weiterleben sollte.'),
('absurdismus', 'Der Mensch in der Revolte', 'Albert Camus', 'sachbuch', 'Über Auflehnung als Antwort auf das Absurde und ihre Grenzen.'),
('absurdismus', 'Der Fremde', 'Albert Camus', 'roman', 'Meursault lebt gleichgültig gegenüber den Erwartungen der Gesellschaft.'),
('absurdismus', 'Die Pest', 'Albert Camus', 'roman', 'Eine Stadt im Ausnahmezustand und Menschen, die trotzdem handeln.'),

('utilitarismus', 'Der Utilitarismus', 'John Stuart Mill', 'sachbuch', 'Die klassische, kurze Verteidigung der Nutzenethik.'),
('utilitarismus', 'Praktische Ethik', 'Peter Singer', 'sachbuch', 'Konsequentes utilitaristisches Denken zu Tieren, Armut und Leben.'),
('utilitarismus', 'Die Omelas den Rücken kehren', 'Ursula K. Le Guin', 'roman', 'Erzählung über eine glückliche Stadt, deren Glück auf dem Leid eines Kindes beruht.'),
('utilitarismus', 'Schuld und Sühne', 'Fjodor Dostojewski', 'roman', 'Raskolnikow rechnet aus, dass ein Mord der Welt nützen würde, und scheitert an sich selbst.'),

('pflichtethik', 'Grundlegung zur Metaphysik der Sitten', 'Immanuel Kant', 'sachbuch', 'Kants kürzeste Einführung in den kategorischen Imperativ.'),
('pflichtethik', 'Gerechtigkeit: Wie wir das Richtige tun', 'Michael J. Sandel', 'sachbuch', 'Anschaulicher Vergleich von Kant, Utilitarismus und Tugendethik an echten Fällen.'),
('pflichtethik', 'Was vom Tage übrig blieb', 'Kazuo Ishiguro', 'roman', 'Ein Butler, der sein Leben der Pflicht gewidmet hat, blickt zurück.'),
('pflichtethik', 'Die Physiker', 'Friedrich Dürrenmatt', 'roman', 'Komödie über die Verantwortung des Wissenden gegenüber der Welt.'),

('tugendethik', 'Nikomachische Ethik', 'Aristoteles', 'sachbuch', 'Die Grundschrift über Glück, Charakter und das rechte Maß.'),
('tugendethik', 'Der Verlust der Tugend', 'Alasdair MacIntyre', 'sachbuch', 'Warum die moderne Moral zerfallen ist und die Tugend zurückkehren sollte.'),
('tugendethik', 'Middlemarch', 'George Eliot', 'roman', 'Menschen einer Kleinstadt wachsen und scheitern an ihren Idealen.'),
('tugendethik', 'Stolz und Vorurteil', 'Jane Austen', 'roman', 'Charakterbildung durch Selbsterkenntnis und Korrektur eigener Urteile.'),

('empirismus', 'Eine Untersuchung über den menschlichen Verstand', 'David Hume', 'sachbuch', 'Humes klare Untersuchung von Erfahrung, Kausalität und Gewohnheit.'),
('empirismus', 'Der Ego-Tunnel', 'Thomas Metzinger', 'sachbuch', 'Hirnforschung und Philosophie zur Frage, ob es ein Selbst gibt.'),
('empirismus', 'Der begrabene Riese', 'Kazuo Ishiguro', 'roman', 'Ein altes Paar sucht seine verlorenen Erinnerungen und damit sich selbst.'),
('empirismus', 'Fiktionen', 'Jorge Luis Borges', 'roman', 'Erzählungen über Gedächtnis, Wahrnehmung und unendliche Welten.'),

('rationalismus', 'Meditationen über die Grundlagen der Philosophie', 'René Descartes', 'sachbuch', 'Der radikale Zweifel und das Ich denke, also bin ich.'),
('rationalismus', 'Ethik', 'Baruch de Spinoza', 'sachbuch', 'Gott, Natur und Freiheit, nach geometrischer Methode bewiesen.'),
('rationalismus', 'Das Spinoza-Problem', 'Irvin D. Yalom', 'roman', 'Roman über Spinozas Leben und seine Wirkung bis ins 20. Jahrhundert.'),
('rationalismus', 'Sofies Welt', 'Jostein Gaarder', 'roman', 'Ein Mädchen erhält rätselhafte Briefe und durchläuft die Geschichte der Philosophie.'),

('buddhismus', 'Was der Buddha lehrt', 'Walpola Rahula', 'sachbuch', 'Klassische, nüchterne Einführung in die Kernlehren des Buddhismus.'),
('buddhismus', 'Buddhismus für Ungläubige', 'Stephen Batchelor', 'sachbuch', 'Buddhistische Praxis ohne Glaubenssätze, für skeptische Leser.'),
('buddhismus', 'Siddhartha', 'Hermann Hesse', 'roman', 'Ein junger Mann sucht Erleuchtung und findet sie erst im Fluss des Lebens.'),
('buddhismus', 'Gammler, Zen und hohe Berge', 'Jack Kerouac', 'roman', 'Zwei Freunde zwischen Beat-Kultur, Bergen und Zen-Praxis.'),

('daoismus', 'Daodejing', 'Laozi', 'sachbuch', 'Die 81 kurzen Verse über das Dao und das Nicht-Handeln.'),
('daoismus', 'Das wahre Buch vom südlichen Blütenland', 'Zhuangzi', 'sachbuch', 'Witzige, paradoxe Gleichnisse über Freiheit und Wandel.'),
('daoismus', 'Tao Te Puh', 'Benjamin Hoff', 'roman', 'Winnie Puh erklärt den Daoismus, leicht und erstaunlich treffend.'),

('nietzsche', 'Jenseits von Gut und Böse', 'Friedrich Nietzsche', 'sachbuch', 'Nietzsches Angriff auf die Moral und die Vorurteile der Philosophen.'),
('nietzsche', 'Nietzsche. Biographie seines Denkens', 'Rüdiger Safranski', 'sachbuch', 'Verständliche Darstellung von Nietzsches Gedankenwelt.'),
('nietzsche', 'Väter und Söhne', 'Iwan Turgenjew', 'roman', 'Der Nihilist Basarow stellt alle Werte seiner Elterngeneration infrage.'),
('nietzsche', 'Die Brüder Karamasow', 'Fjodor Dostojewski', 'roman', 'Wenn es keinen Gott gibt, ist dann alles erlaubt?'),

('pragmatismus', 'Pragmatismus', 'William James', 'sachbuch', 'Vorlesungen über Wahrheit als das, was sich bewährt.'),
('pragmatismus', 'Kontingenz, Ironie und Solidarität', 'Richard Rorty', 'sachbuch', 'Über Wahrheit ohne Fundament und Solidarität ohne Metaphysik.'),
('pragmatismus', 'Zen und die Kunst, ein Motorrad zu warten', 'Robert M. Pirsig', 'roman', 'Eine Motorradreise wird zur Suche nach dem Begriff der Qualität.'),

('kompatibilismus', 'Das Handwerk der Freiheit', 'Peter Bieri', 'sachbuch', 'Wie Willensfreiheit trotz Ursachen möglich ist, klar und ohne Fachjargon.'),
('kompatibilismus', 'Ellenbogenfreiheit', 'Daniel C. Dennett', 'sachbuch', 'Warum wir die Freiheit wollen sollten, die wir tatsächlich haben.'),
('kompatibilismus', 'Nachtzug nach Lissabon', 'Pascal Mercier', 'roman', 'Ein Lehrer bricht aus seinem Leben aus und fragt, wie frei er je war.'),
('kompatibilismus', 'Schlachthof 5', 'Kurt Vonnegut', 'roman', 'Billy Pilgrim erlebt die Zeit als festgelegt, und lebt trotzdem.'),

('kritische_theorie', 'Haben oder Sein', 'Erich Fromm', 'sachbuch', 'Zwei Grundhaltungen zum Leben und warum die Gesellschaft das Haben fördert.'),
('kritische_theorie', 'Minima Moralia', 'Theodor W. Adorno', 'sachbuch', 'Aphorismen über das beschädigte Leben in der modernen Gesellschaft.'),
('kritische_theorie', '1984', 'George Orwell', 'roman', 'Totale Kontrolle bis in die Sprache und das Denken hinein.'),
('kritische_theorie', 'Schöne neue Welt', 'Aldous Huxley', 'roman', 'Eine Gesellschaft, die ihre Menschen durch Vergnügen beherrscht.'),

('platonismus', 'Apologie des Sokrates', 'Platon', 'sachbuch', 'Sokrates verteidigt vor Gericht das prüfende Leben.'),
('platonismus', 'Der Staat (Politeia)', 'Platon', 'sachbuch', 'Gerechtigkeit, Ideenlehre und das Höhlengleichnis.'),
('platonismus', 'Sofies Welt', 'Jostein Gaarder', 'roman', 'Ein Roman, der wie eine Reise aus Platons Höhle funktioniert.')
on conflict (school_slug, title) do nothing;

insert into public.questions (text, theme, source_hint) values
('Wenn du morgen alle Erinnerungen verlierst, bist du dann noch derselbe Mensch?', 'Identität', 'Nach John Locke'),
('Wärst du lieber ein zufriedenes Schwein oder ein unzufriedener Sokrates?', 'Glück', 'Nach John Stuart Mill'),
('Darf man lügen, um einen Freund zu schützen?', 'Ethik', 'Nach Immanuel Kant'),
('Ist ein Leben ohne Leid überhaupt wünschenswert?', 'Glück', 'Nach Friedrich Nietzsche'),
('Hättest du heute anders handeln können, als du gehandelt hast?', 'Freiheit', 'Nach Peter Bieri'),
('Würdest du an eine Maschine angeschlossen werden wollen, die dir ein perfektes, aber simuliertes Leben schenkt?', 'Glück', 'Nach Robert Nozick'),
('Was schuldest du Menschen, die du nie treffen wirst?', 'Ethik', 'Nach Peter Singer'),
('Muss ein Leben einen Sinn haben, um lebenswert zu sein?', 'Sinn', 'Nach Albert Camus'),
('Woher weißt du, dass du gerade nicht träumst?', 'Erkenntnis', 'Nach René Descartes'),
('Ist es wichtiger, gut zu handeln oder ein guter Mensch zu sein?', 'Ethik', 'Nach Aristoteles'),
('Worüber ärgerst du dich, obwohl es nicht in deiner Macht steht?', 'Gelassenheit', 'Nach Epiktet'),
('Gehört dein Körper zu dir, oder bist du dein Körper?', 'Identität', 'Leib-Seele-Problem'),
('Wenn alle anderen etwas für richtig halten, kann es dann trotzdem falsch sein?', 'Wahrheit', 'Nach Platon'),
('Ist der Tod etwas Schlechtes für den, der stirbt?', 'Tod', 'Nach Epikur'),
('Kann man jemandem vergeben, der es nicht bereut?', 'Ethik', 'Nach Hannah Arendt'),
('Was würdest du tun, wenn du unsichtbar wärst und niemand es je erführe?', 'Ethik', 'Der Ring des Gyges, Platon'),
('Ist Freundschaft wertvoll, weil sie dir nützt, oder unabhängig davon?', 'Beziehungen', 'Nach Aristoteles'),
('Bist du für deinen Charakter verantwortlich?', 'Freiheit', 'Nach Aristoteles'),
('Gibt es eine Wahrheit, die du lieber nicht wissen möchtest?', 'Wahrheit', 'Nach Friedrich Nietzsche'),
('Sollte man fünf Menschen retten, wenn dafür einer sterben muss?', 'Ethik', 'Das Trolley-Problem, Philippa Foot'),
('Besitzt du deine Dinge, oder besitzen sie dich?', 'Lebensführung', 'Nach Erich Fromm'),
('Ist Nichtstun manchmal die klügste Handlung?', 'Lebensführung', 'Nach Laozi'),
('Hat ein Tier dieselben Rechte wie ein Mensch?', 'Ethik', 'Nach Peter Singer'),
('Ist etwas schön, weil es dir gefällt, oder gefällt es dir, weil es schön ist?', 'Ästhetik', 'Nach Platon und Hume'),
('Kannst du dir sicher sein, dass andere Menschen wirklich fühlen wie du?', 'Erkenntnis', 'Das Fremdpsychische'),
('Würdest du dein Leben genau so noch einmal leben wollen, unendlich oft?', 'Sinn', 'Die ewige Wiederkunft, Nietzsche'),
('Ist eine Meinung wahr, wenn sie dir im Leben hilft?', 'Wahrheit', 'Nach William James'),
('Wer bist du, wenn niemand zusieht?', 'Identität', 'Nach Søren Kierkegaard'),
('Darf der Staat dich zu deinem eigenen Glück zwingen?', 'Politik', 'Nach John Stuart Mill'),
('Ist dein Ich etwas, das du hast, oder etwas, das du tust?', 'Identität', 'Nach David Hume und dem Buddhismus')
on conflict (text) where origin = 'kuratiert' do nothing;
