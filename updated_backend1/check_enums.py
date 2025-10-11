import psycopg2

try:
    conn = psycopg2.connect('postgresql://postgres:root@localhost:5432/linecricket25')
    cur = conn.cursor()
    
    # Check all enum types in the database
    cur.execute("SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;")
    enum_types = cur.fetchall()
    print('All enum types in database:', enum_types)
    
    # Check if there are multiple academy type enums
    for enum_type in enum_types:
        if 'academy' in enum_type[0].lower():
            print(f'\nChecking {enum_type[0]}:')
            try:
                cur.execute(f"SELECT unnest(enum_range(NULL::{enum_type[0]}));")
                values = cur.fetchall()
                print(f'{enum_type[0]} values:', values)
            except Exception as e:
                print(f'Error checking {enum_type[0]}: {e}')
    
    # Check ACADEMYTYPE enum values
    cur.execute("SELECT unnest(enum_range(NULL::academytype));")
    academy_values = cur.fetchall()
    print('\nACADEMYTYPE values:', academy_values)
    
    # Check ACADEMYLEVEL enum values
    cur.execute("SELECT unnest(enum_range(NULL::academylevel));")
    level_values = cur.fetchall()
    print('ACADEMYLEVEL values:', level_values)
    
    conn.close()
    print("Enum check completed successfully!")
    
except Exception as e:
    print(f"Error: {e}")
