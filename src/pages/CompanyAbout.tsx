import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Award, Users, Factory, Shield, Phone, Mail } from "lucide-react";

const team = [
  { role: "Директор", name: "Орекешев Аскар Музабекович", phone: "+7 (932) 536-91-29" },
  { role: "Главный инженер", name: "Белушкин Юрий Алексеевич", phone: "+7 (922) 547-19-49" },
  { role: "Начальник ПТО", name: "Зайцев Дмитрий Александрович", phone: "+7 (903) 366-44-95" },
  { role: "Главный бухгалтер", name: "Тамарова Александра Владимировна", phone: "+7 (922) 536-18-77" },
  { role: "Технический директор", name: "Грачиков Юрий Юрьевич", phone: "+7 (903) 395-12-70" },
];

const CompanyAbout = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-6">О компании</h1>
        <p className="text-lg text-muted-foreground mb-12">
          ООО «СКБ УРАЛ56» — проектирование и строительство быстровозводимых зданий, модульных конструкций, торговых комплексов, складских помещений и сельскохозяйственных объектов. Компания основана в 2023 году.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Factory, title: "Полный цикл работ", desc: "От проектирования до сдачи объекта под ключ" },
            { icon: Users, title: "Опытная команда", desc: "Инженеры, проектировщики, монтажники" },
            { icon: Award, title: "Допуск СРО", desc: "Проектирование и строительство" },
            { icon: Shield, title: "Допуск ОПО", desc: "Работа на особо опасных объектах" },
          ].map(item => (
            <div key={item.title} className="bg-card border border-border rounded-xl p-6">
              <item.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-display mb-4">Наша миссия</h2>
          <p className="text-muted-foreground">
            Мы строим здания, которые помогают бизнесу расти: быстро, качественно и по оптимальной цене. Каждый проект — это индивидуальное решение под задачи клиента.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-display mb-4">Продуктовый портфель</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {[
              "Модульные здания",
              "Быстровозводимые здания",
              "Торговые комплексы",
              "Складские помещения",
              "Сельхоз объекты (ангары, склады)",
            ].map(item => (
              <li key={item} className="flex items-center gap-2 text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-display mb-6">Команда</h2>
          <div className="space-y-4">
            {team.map(member => (
              <div key={member.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-card border border-border rounded-xl">
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <a 
                  href={`tel:${member.phone.replace(/\D/g, '')}`} 
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {member.phone}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-secondary rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Общая почта:</span>
              <a href="mailto:skbural@mail.ru" className="text-primary hover:underline">skbural@mail.ru</a>
            </div>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default CompanyAbout;
