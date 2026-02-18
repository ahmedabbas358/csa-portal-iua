import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Seeding database...\n');

    // ─── Dean Config (Master Key) ─────────────────────────────────────
    const DEAN_MASTER_KEY = 'CSA_MASTER_KEY_2024_AFRICA_UNI_SECURE_ACCESS_V1_X99_AB7_KL2';
    const hashedKey = await bcrypt.hash(DEAN_MASTER_KEY, SALT_ROUNDS);

    await prisma.deanConfig.upsert({
        where: { id: 'config' },
        update: { masterKey: hashedKey },
        create: {
            id: 'config',
            masterKey: hashedKey,
            securityQuestion: 'What is the default year?',
            securityAnswer: '2010',
            backupCode: 'CSA-BACKUP-INIT-2024',
        }
    });
    console.log('✅ Dean config seeded');
    console.log(`   🔑 Dean Master Key: ${DEAN_MASTER_KEY}`);
    console.log('   📌 Access keys are generated from the Dean Dashboard\n');

    // ─── App Settings ─────────────────────────────────────────────────
    await prisma.appSetting.upsert({
        where: { id: 'main' },
        update: {},
        create: {
            id: 'main',
            siteNameEn: 'CS Student Association',
            siteNameAr: 'جمعية طلاب الحاسوب',
            logoUrl: '',
            primaryColor: '#0284c7',
            secondaryColor: '#0c4a6e',
            aboutTextAr: 'جمعية طلابية متخصصة في مجال الحاسب الآلي تم إنشائها في 2010 بواسطة طلاب من كلية دراسات الحاسوب بجامعة أفريقيا العالمية.',
            aboutTextEn: 'A student association specialized in Computer Science, established in 2010 by students from the Faculty of Computer Studies at the International University of Africa.',
            visionAr: 'أن نكون المنصة الرائدة في تمكين طلاب الحاسوب وبناء قادة المستقبل التقني.',
            visionEn: 'To be the leading platform in empowering computer students and building future tech leaders.',
            missionAr: 'سد الفجوة بين المنهج الأكاديمي وسوق العمل من خلال ورش العمل والمشاريع.',
            missionEn: 'Bridging the gap between academic curriculum and the job market through workshops and projects.',
            borderRadius: 'xl',
            animationSpeed: 'normal',
            fontStyle: 'cairo',
            backgroundPattern: 'none',
        }
    });
    console.log('✅ App settings seeded');

    // ─── Events ───────────────────────────────────────────────────────
    await prisma.event.deleteMany({});
    await prisma.event.createMany({
        data: [
            {
                title: 'AI Summit 2024', titleAr: 'قمة الذكاء الاصطناعي',
                description: 'Join us for a day full of innovation and AI talks.',
                descriptionAr: 'انضم إلينا في يوم مليء بالابتكار ومحاضرات الذكاء الاصطناعي.',
                date: '2024-12-15', time: '09:00 AM', isCompleted: false,
                location: 'Main Hall', locationAr: 'القاعة الرئيسية',
                image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
                type: 'Summit',
            },
            {
                title: 'Web Dev Workshop', titleAr: 'ورشة تطوير الويب',
                description: 'Learn React from scratch.',
                descriptionAr: 'تعلم React من الصفر.',
                date: '2024-11-20', time: '11:00 AM', isCompleted: true,
                location: 'Lab 3', locationAr: 'معمل 3',
                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
                type: 'Workshop',
            },
        ]
    });
    console.log('✅ Events seeded');

    // ─── Members ──────────────────────────────────────────────────────
    await prisma.member.deleteMany({});
    await prisma.member.createMany({
        data: [
            {
                name: 'Ahmed Ali', role: 'President', roleAr: 'رئيس الجمعية',
                office: 'Executive Office', officeAr: 'المكتب التنفيذي',
                category: 'executive', term: '2024-2025',
                image: 'https://i.pravatar.cc/300?img=11', email: 'pres@csa.edu',
            },
            {
                name: 'Sarah Omer', role: 'Media Head', roleAr: 'رئيس المكتب الإعلامي',
                office: 'Media Office', officeAr: 'المكتب الإعلامي',
                category: 'head', term: '2024-2025',
                image: 'https://i.pravatar.cc/300?img=5', email: 'media@csa.edu',
            },
        ]
    });
    console.log('✅ Members seeded');

    // ─── News ─────────────────────────────────────────────────────────
    await prisma.news.deleteMany({});
    await prisma.news.createMany({
        data: [
            {
                title: 'Tech Week is coming!',
                content: 'Get ready for the biggest tech event of the year. #TechWeek #CSA',
                date: '2024-10-15', author: 'Media Team',
                tags: JSON.stringify(['Events']),
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
                views: 1240, likes: 124, status: 'published',
                design: JSON.stringify({
                    fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center',
                    overlayText: '', overlayOpacity: 30,
                    imagePosition: { x: 50, y: 50, scale: 1 },
                    filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 }
                }),
            },
            {
                title: 'New Board Members',
                content: 'Welcoming our new executive board for the 2024 term!',
                date: '2024-09-01', author: 'Admin',
                tags: JSON.stringify(['News']),
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
                views: 3420, likes: 89, status: 'published',
                design: JSON.stringify({
                    fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center',
                    overlayText: '', overlayOpacity: 30,
                    imagePosition: { x: 50, y: 50, scale: 1 },
                    filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 }
                }),
            },
        ]
    });
    console.log('✅ News seeded');

    // ─── Timeline ─────────────────────────────────────────────────────
    await prisma.timelineItem.deleteMany({});
    await prisma.timelineItem.createMany({
        data: [
            { year: '2010', icon: 'Layers', titleAr: 'التأسيس', titleEn: 'The Beginning', descAr: 'انطلاق الجمعية بكلية دراسات الحاسوب، جامعة أفريقيا العالمية.', descEn: 'The association was founded at the Faculty of Computer Studies, IUA.' },
            { year: '2015', icon: 'BookOpen', titleAr: 'النقلة النوعية', titleEn: 'Major Expansion', descAr: 'إطلاق أول مؤتمر تقني سنوي وتوسيع قاعدة العضوية.', descEn: 'Launch of the first annual tech conference and membership expansion.' },
            { year: '2020', icon: 'Zap', titleAr: 'التحول الرقمي', titleEn: 'Digital Shift', descAr: 'التركيز على الفعاليات الافتراضية والمسابقات البرمجية العالمية.', descEn: 'Focus on virtual events and global programming competitions.' },
            { year: '2024', icon: 'Target', titleAr: 'نحو المستقبل', titleEn: 'Future Horizons', descAr: 'إطلاق المنصة الجديدة وتوسيع الشراكات مع سوق العمل.', descEn: 'Launching the new platform and expanding partnerships with the job market.' },
        ]
    });
    console.log('✅ Timeline seeded');

    // ─── Clear old sessions & access keys ─────────────────────────────
    await prisma.accessKey.deleteMany({});
    await prisma.deanSession.deleteMany({});
    await prisma.adminSession.deleteMany({});
    console.log('✅ Old sessions & keys cleared');

    console.log('\n🎉 Seeding complete!');
    console.log('\n📋 How to use:');
    console.log('─────────────────────────────────────────');
    console.log(`1. Login as Dean with: ${DEAN_MASTER_KEY}`);
    console.log('2. Go to Dean Dashboard → Generate Access Keys');
    console.log('3. Share generated keys with admins');
    console.log('4. Admins use their keys to login');
    console.log('─────────────────────────────────────────');
}

main()
    .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
