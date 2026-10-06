<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::updateOrCreate(
                ['email' => (string) env('SEED_USER_EMAIL', 'demo@example.com')],
                [
                    'password' => Hash::make((string) env('SEED_USER_PASSWORD', 'password123')),
                    'email_verified_at' => now(),
                ],
            );

            $data = $this->seedData();
            $groups = $this->seedGroups($user->id, $data['groups']);
            $people = $this->seedPeople($user->id, $groups, $data['people']);

            $this->seedDiaries($user->id, $people, $data['diaries']);
        });
    }

    /**
     * @param array<int, array<string, mixed>> $definitions
     * @return array<string, int>
     */
    private function seedGroups(int $userId, array $definitions): array
    {
        $groups = [];

        foreach ($definitions as $definition) {
            $groupKey = (string) $definition['key'];
            $query = DB::table('groups')
                ->where('user_id', $userId)
                ->where('name', $definition['name']);
            $existing = $query->first();

            $attributes = [
                'name' => $definition['name'],
                'color' => $definition['color'],
                'sort_order' => $definition['sort_order'],
            ];

            if ($existing !== null) {
                $query->update([
                    ...$attributes,
                    'updated_at' => now(),
                ]);
                $groups[$groupKey] = (int) $existing->id;
                continue;
            }

            $groups[$groupKey] = (int) DB::table('groups')->insertGetId([
                'user_id' => $userId,
                ...$attributes,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $groups;
    }

    /**
     * @param array<string, int> $groups
     * @param array<int, array<string, mixed>> $definitions
     * @return array<string, int>
     */
    private function seedPeople(int $userId, array $groups, array $definitions): array
    {
        $people = [];

        foreach ($definitions as $definition) {
            $personKey = (string) $definition['key'];
            $query = DB::table('people')
                ->where('user_id', $userId)
                ->where('name', $definition['name']);
            $existing = $query->first();

            $attributes = [
                'name' => $definition['name'],
                'group_id' => $groups[$definition['group_key']] ?? null,
                'notes' => $definition['notes'],
                'avatar_color' => $definition['avatar_color'],
            ];

            if ($existing !== null) {
                $query->update([
                    ...$attributes,
                    'updated_at' => now(),
                ]);
                $people[$personKey] = (int) $existing->id;
                continue;
            }

            $people[$personKey] = (int) DB::table('people')->insertGetId([
                'user_id' => $userId,
                ...$attributes,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $people;
    }

    /**
     * @param array<string, int> $people
     * @param array<int, array<string, mixed>> $definitions
     */
    private function seedDiaries(int $userId, array $people, array $definitions): void
    {
        foreach ($definitions as $definition) {
            $query = DB::table('diaries')
                ->where('user_id', $userId)
                ->where('diary_date', $definition['diary_date']);
            $existing = $query->first();

            if ($existing !== null) {
                $query->update([
                    'content' => $definition['content'],
                    'updated_at' => now(),
                ]);
                $diaryId = (int) $existing->id;
            } else {
                $diaryId = (int) DB::table('diaries')->insertGetId([
                    'user_id' => $userId,
                    'content' => $definition['content'],
                    'diary_date' => $definition['diary_date'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('diary_people')->where('diary_id', $diaryId)->delete();

            $personIds = array_map(
                fn (string $personKey): int => $people[$personKey],
                $definition['person_keys'],
            );

            if ($personIds !== []) {
                DB::table('diary_people')->insert(array_map(
                    fn (int $personId): array => [
                        'user_id' => $userId,
                        'diary_id' => $diaryId,
                        'person_id' => $personId,
                    ],
                    $personIds,
                ));
            }
        }
    }

    /**
     * Seeder data is kept separate from the persistence logic so that adding
     * development scenarios does not change the seed-upsert behavior.
     *
     * @return array{
     *     groups: array<int, array<string, mixed>>,
     *     people: array<int, array<string, mixed>>,
     *     diaries: array<int, array<string, mixed>>
     * }
     */
    private function seedData(): array
    {
        return [
            'groups' => [
                ['key' => 'family', 'name' => '家族', 'color' => 'yellow', 'sort_order' => 1],
                ['key' => 'friends', 'name' => '友人', 'color' => 'indigo', 'sort_order' => 2],
                ['key' => 'work', 'name' => '仕事', 'color' => 'gray-2', 'sort_order' => 3],
                ['key' => 'community', 'name' => '地域', 'color' => 'gray-3', 'sort_order' => 4],
            ],
            'people' => [
                [
                    'key' => 'hanako_yamada',
                    'name' => '山田 花子',
                    'group_key' => 'family',
                    'notes' => '北海道出身。子どもの頃は祖父母の家で過ごす時間が長く、季節の行事を大切にしている。休日は家で料理をしたり、近所を散歩しながら写真を撮ったりする。好きな料理はスープカレー。',
                    'avatar_color' => 'yellow',
                ],
                [
                    'key' => 'taro_sato',
                    'name' => '佐藤 太郎',
                    'group_key' => 'friends',
                    'notes' => '大学時代からの友人。学生の頃は一緒に軽音楽サークルで活動していた。現在は映画とキャンプが趣味で、見た映画の感想をよく教えてくれる。新しいお店を探すのも好き。',
                    'avatar_color' => 'indigo',
                ],
                [
                    'key' => 'ichiro_suzuki',
                    'name' => '鈴木 一郎',
                    'group_key' => 'work',
                    'notes' => '関西出身。前職では営業を経験し、現在はプロダクト開発に関わっている。仕事の段取りを考えるのが得意で、休日はランニングとコーヒーの淹れ方を研究している。',
                    'avatar_color' => 'gray-2',
                ],
                [
                    'key' => 'jiro_takahashi',
                    'name' => '高橋 次郎',
                    'group_key' => null,
                    'notes' => '最近知り合った人。海外で暮らしていた時期があり、各地の文化や言語に詳しい。趣味は読書と美術館巡りで、休日には知らない街を歩いて新しい店を見つけている。',
                    'avatar_color' => 'gray-3',
                ],
                [
                    'key' => 'yuki_kato',
                    'name' => '加藤 雪',
                    'group_key' => 'friends',
                    'notes' => '高校時代からの友人。絵を描くことが好きで、最近はデジタルイラストを練習している。甘いものに詳しく、気になるカフェを見つけるとすぐに共有してくれる。',
                    'avatar_color' => 'gray-1',
                ],
                [
                    'key' => 'naoko_ito',
                    'name' => '伊藤 直子',
                    'group_key' => 'community',
                    'notes' => '地域の読書会で知り合った。子どもの頃から本が好きで、特にノンフィクションをよく読む。地域のイベント運営にも関わっており、人をつなぐ活動に関心がある。',
                    'avatar_color' => 'gray-4',
                ],
            ],
            'diaries' => [
                [
                    'diary_date' => '2026-09-20',
                    'content' => '朝に散歩をして、季節の変化に気づいた。午後は家でゆっくり料理をした。',
                    'person_keys' => [],
                ],
                [
                    'diary_date' => '2026-09-21',
                    'content' => '山田さんと夕食を食べながら、最近の出来事をゆっくり話した。',
                    'person_keys' => ['hanako_yamada'],
                ],
                [
                    'diary_date' => '2026-09-22',
                    'content' => '仕事の合間に鈴木さんと今週の進め方を整理した。やることが少し明確になった。',
                    'person_keys' => ['ichiro_suzuki'],
                ],
                [
                    'diary_date' => '2026-09-23',
                    'content' => '佐藤さんと新しくできたカフェへ行った。次は別のメニューも試してみたい。',
                    'person_keys' => ['taro_sato'],
                ],
                [
                    'diary_date' => '2026-09-24',
                    'content' => '読書会で伊藤さんからおすすめの本を教えてもらった。週末に読んでみる。',
                    'person_keys' => ['naoko_ito'],
                ],
                [
                    'diary_date' => '2026-09-25',
                    'content' => '今日は一人の時間を作って、積んでいた本を少し読み進めた。',
                    'person_keys' => [],
                ],
                [
                    'diary_date' => '2026-09-26',
                    'content' => '高橋さんと美術館へ行った。展示を見ながら、知らないものを知る楽しさについて話した。',
                    'person_keys' => ['jiro_takahashi'],
                ],
                [
                    'diary_date' => '2026-09-27',
                    'content' => '加藤さんとお気に入りの店でお茶をした。最近描いている絵を見せてもらった。',
                    'person_keys' => ['yuki_kato'],
                ],
                [
                    'diary_date' => '2026-09-28',
                    'content' => '家族と電話で話した。次に会うときに行きたい場所をいくつか決めた。',
                    'person_keys' => ['hanako_yamada'],
                ],
                [
                    'diary_date' => '2026-09-29',
                    'content' => '鈴木さんと高橋さんを交えて、仕事のアイデアについて意見交換をした。',
                    'person_keys' => ['ichiro_suzuki', 'jiro_takahashi'],
                ],
                [
                    'diary_date' => '2026-09-30',
                    'content' => '地域のイベントを手伝った。伊藤さんのおかげで初めて会う人とも自然に話せた。',
                    'person_keys' => ['naoko_ito'],
                ],
                [
                    'diary_date' => '2026-10-01',
                    'content' => '家族と夕食を食べながら、最近の出来事をゆっくり話した。',
                    'person_keys' => ['hanako_yamada'],
                ],
                [
                    'diary_date' => '2026-10-02',
                    'content' => '友人とこれからやりたいことについて話した。小さくても計画にしてみる。',
                    'person_keys' => ['taro_sato', 'yuki_kato'],
                ],
                [
                    'diary_date' => '2026-10-03',
                    'content' => '仕事終わりに、今週できたことと来週やることを整理した。',
                    'person_keys' => ['ichiro_suzuki'],
                ],
            ],
        ];
    }
}
